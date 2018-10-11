package plugin.firebase.database;

import android.content.Context;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.v4.app.NavUtils;
import android.util.Log;

import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.OnDisconnect;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import plugin.firebase.core.FirebaseAppPlugin;
import plugin.firebase.core.IActionHandler;
import rufus.lzstring4java.LZString;

public class FirebaseDatabasePlugin extends CordovaPlugin {
  private final String TAG = "FireDatabasePlugin";

  private FirebaseDatabase database;
  private final Map<String, IActionHandler> handlers = new ConcurrentHashMap<>();
  private final Map<String, Object> objects = new ConcurrentHashMap<>();
  private Context context;

  FirebaseDatabasePlugin(FirebaseDatabase firebaseDB) {
    this.database = firebaseDB;
  }


  //- (void)execJS: (NSString *)jsString;
  //- (NSString *)serialize: (id)target error:(NSError **)error;
  //- (id)deserialize: (NSString*)serializedStr error:(NSError **)error;
  //

  @Override
  protected void pluginInitialize() {
    this.context = cordova.getContext();
  }

  @Override
  public boolean execute(final String action, final JSONArray args, final CallbackContext callbackContext) throws JSONException {
    if (handlers.containsKey(action)) {
      try {
        handlers.get(action).handle(args, callbackContext);
        return true;
      } catch (Exception e) {
        Log.e(action, e.getMessage(), e);
        callbackContext.error(e.getMessage());
        return false;
      }
    } else {
      return false;
    }
  }

  private void execJS(String jsString) {
    webView.loadUrl(jsString);
  }

  private String serialize(Object target) throws JSONException {
    if (target instanceof JSONObject) {
      return LZString.compressToBase64(((JSONObject) target).toString(0));
    } else if (target instanceof JSONArray) {
      return LZString.compressToBase64(((JSONArray) target).toString(0));
    } else {
      return LZString.compressToBase64((String)target);
    }
  }

  private Object deserialize(String serializedStr) {
    serializedStr = LZString.decompressFromBase64(serializedStr);
    try {
      if (serializedStr.startsWith("{") && serializedStr.endsWith("}")) {
        return new JSONObject(serializedStr);
      } else if (serializedStr.startsWith("[") && serializedStr.endsWith("]")) {
        return new JSONArray(serializedStr);
      }
      return serializedStr;
    } catch (Exception e) {
      // ignore
      return serializedStr;
    }
  }

  public static ArrayList<Object> Json2Map(JSONArray jsonArray) throws JSONException {

    ArrayList<Object> array = new ArrayList<Object>();

    Object value2;
    for (int i = 0; i < jsonArray.length(); i++) {
      value2 = jsonArray.get(i);
      if (value2 == null ||
              Boolean.class.isInstance(value2) ||
              value2 instanceof Number ||
              value2 instanceof String) {
        array.add(value2);
      } else if (JSONObject.class.isInstance(value2)) {
        array.add(Json2Map((JSONObject)value2));
      } else if (JSONArray.class.isInstance(value2)) {
        array.add(Json2Map((JSONArray)value2));
      } else {
        array.add(value2 + "");
      }
    }
    return array;
  }

  public static Map<String, Object> Json2Map(JSONObject json) throws JSONException {
    HashMap<String, Object> mMap = new HashMap<>();
    @SuppressWarnings("unchecked")
    Iterator<String> iterator = json.keys();
    Object value;
    while (iterator.hasNext()) {
      String key = iterator.next();
      try {
        value = json.get(key);
        if (value == null ||
                Boolean.class.isInstance(value) ||
                value instanceof Number ||
                value instanceof String) {
          mMap.put(key, value);
        } else if (JSONObject.class.isInstance(value)) {
          mMap.put(key, Json2Map((JSONObject)value));
        } else if (JSONArray.class.isInstance(value)) {
          mMap.put(key, Json2Map((JSONArray)value));
        } else {
          mMap.put(key, value + "");
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return mMap;
  }

  /******************************************
   * Methods for Database class
   *****************************************/

  //---------------------------------------------------------------------------------
  // Database.goOffline
  // https://firebase.google.com/docs/reference/js/firebase.database.Database#goOffline
  //---------------------------------------------------------------------------------
  private class database_goOffline implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {
      Log.d(TAG, "[android] database.goOffline()");
      database.goOffline();
      callbackContext.success();
    }
  }

  //---------------------------------------------------------------------------------
  // Database.goOnline
  // https://firebase.google.com/docs/reference/js/firebase.database.Database#goOnline
  //---------------------------------------------------------------------------------
  private class database_goOnline implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      Log.d(TAG, "[android] database.goOnline()");
      database.goOnline();
      callbackContext.success();
    }
  }

  //---------------------------------------------------------------------------------
  // Database.ref
  // https://firebase.google.com/docs/reference/js/firebase.database.Database#ref
  //---------------------------------------------------------------------------------
  private class database_ref implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {
      JSONObject options = args.getJSONObject(0);

      Log.d(TAG, "[android] database.ref()");

      String refId = options.getString("id");
      String path = options.getString("path");

      DatabaseReference ref;
      if (path == null || path.isEmpty()) {
        ref = database.getReference();
      } else {
        ref = database.getReference(path);
      }

      synchronized (objects) {
        objects.put(refId, ref);
      }

      callbackContext.success();
    }
  }

  /******************************************
   * Methods for OnDisconnect class
   *****************************************/

  //---------------------------------------------------------------------------------
  // onDisconnect.cancel
  // https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#cancel
  //---------------------------------------------------------------------------------
  private class onDisconnect_cancel implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      JSONObject options = args.getJSONObject(0);

      Log.d(TAG, "[android] onDisconnect.cancel()");

      String targetId = options.getString("targetId");

      synchronized (objects) {
        if (objects.containsKey(targetId)) {
          final OnDisconnect onDisconnect = (OnDisconnect)objects.get(targetId);
          onDisconnect.cancel(new DatabaseReference.CompletionListener() {
            @Override
            public void onComplete(@Nullable DatabaseError databaseError, @NonNull DatabaseReference databaseReference) {

              if (databaseError != null) {
                Log.e(TAG, "onDiconnect.cancel() error\n" + databaseError.getDetails());
                callbackContext.error(databaseError.getMessage());
              } else {
                callbackContext.success();
              }
              synchronized (objects) {
                objects.remove(onDisconnect);
              }
            }
          });
        } else {
          callbackContext.error("Can not find onDisconnect instance from " + targetId);
        }
      }
    }
  }

  //---------------------------------------------------------------------------------
  // onDisconnect.remove
  // https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#remove
  //---------------------------------------------------------------------------------
  private class onDisconnect_remove implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      JSONObject options = args.getJSONObject(0);

      Log.d(TAG, "[android] onDisconnect.remove()");

      String targetId = options.getString("targetId");

      synchronized (objects) {
        if (objects.containsKey(targetId)) {
          final OnDisconnect onDisconnect = (OnDisconnect) objects.get(targetId);
          onDisconnect.removeValue(new DatabaseReference.CompletionListener() {
            @Override
            public void onComplete(@Nullable DatabaseError databaseError, @NonNull DatabaseReference databaseReference) {

              if (databaseError != null) {
                Log.e(TAG, "onDiconnect.remove() error\n" + databaseError.getDetails());
                callbackContext.error(databaseError.getMessage());
              } else {
                callbackContext.success();
              }
            }
          });
        } else {
          callbackContext.error("Can not find onDisconnect instance from " + targetId);
        }
      }
    }
  }

  //---------------------------------------------------------------------------------
  // onDisconnect.set
  // https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#set
  //---------------------------------------------------------------------------------
  private class onDisconnect_set implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      JSONObject options = args.getJSONObject(0);

      Log.d(TAG, "[android] onDisconnect.set()");

      String targetId = options.getString("targetId");
      String serializedValue = options.getString("value");
      final Object valueObj = deserialize(serializedValue);

      synchronized (objects) {
        if (objects.containsKey(targetId)) {
          final OnDisconnect onDisconnect = (OnDisconnect) objects.get(targetId);
          onDisconnect.setValue(valueObj, new DatabaseReference.CompletionListener() {
            @Override
            public void onComplete(@Nullable DatabaseError databaseError, @NonNull DatabaseReference databaseReference) {

              if (databaseError != null) {
                Log.e(TAG, "onDiconnect.set() error\n" + databaseError.getDetails());
                callbackContext.error(databaseError.getMessage());
              } else {
                callbackContext.success();
              }
            }
          });
        } else {
          callbackContext.error("Can not find onDisconnect instance from " + targetId);
        }
      }
    }
  }

  private class onDisconnect_setWithPriority implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      JSONObject options = args.getJSONObject(0);

      Log.d(TAG, "[android] onDisconnect.setWithPriority()");

      String targetId = options.getString("targetId");
      String serializedValue = options.getString("value");
      final Object valueObj = deserialize(serializedValue);

      Object priority = options.get("priority");

      synchronized (objects) {
        if (objects.containsKey(targetId)) {
          final OnDisconnect onDisconnect = (OnDisconnect) objects.get(targetId);
          if (priority == null || priority instanceof String) {
            onDisconnect.setValue(valueObj, (String)priority, new DatabaseReference.CompletionListener() {
              @Override
              public void onComplete(@Nullable DatabaseError databaseError, @NonNull DatabaseReference databaseReference) {

                if (databaseError != null) {
                  Log.e(TAG, "onDiconnect.setWithPriority() error\n" + databaseError.getDetails());
                  callbackContext.error(databaseError.getMessage());
                } else {
                  callbackContext.success();
                }
              }
            });
          } else if (priority instanceof Number) {

            onDisconnect.setValue(valueObj, (double) priority, new DatabaseReference.CompletionListener() {
              @Override
              public void onComplete(@Nullable DatabaseError databaseError, @NonNull DatabaseReference databaseReference) {

                if (databaseError != null) {
                  Log.e(TAG, "onDiconnect.setWithPriority() error\n" + databaseError.getDetails());
                  callbackContext.error(databaseError.getMessage());
                } else {
                  callbackContext.success();
                }
              }
            });
          } else {
            callbackContext.error("priority must be string, number or null");
          }
        } else {
          callbackContext.error("Can not find onDisconnect instance from " + targetId);
        }
      }
    }
  }

  private class onDisconnect_update implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      JSONObject options = args.getJSONObject(0);

      Log.d(TAG, "[android] onDisconnect.update()");

      String targetId = options.getString("targetId");
      String serializedValue = options.getString("value");
      JSONObject values = (JSONObject)deserialize(serializedValue);

      Map<String, Object> valueObj = Json2Map(values);


      synchronized (objects) {
        if (objects.containsKey(targetId)) {
          final OnDisconnect onDisconnect = (OnDisconnect) objects.get(targetId);
          onDisconnect.updateChildren(valueObj, new DatabaseReference.CompletionListener() {
            @Override
            public void onComplete(@Nullable DatabaseError databaseError, @NonNull DatabaseReference databaseReference) {

              if (databaseError != null) {
                Log.e(TAG, "onDiconnect.update() error\n" + databaseError.getDetails());
                callbackContext.error(databaseError.getMessage());
              } else {
                callbackContext.success();
              }
            }
          });
        } else {
          callbackContext.error("Can not find onDisconnect instance from " + targetId);
        }
      }
    }
  }

  private class reference_child implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      callbackContext.success();
    }
  }

  private class reference_onDisconnect implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      callbackContext.success();
    }
  }

  private class reference_push implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      callbackContext.success();
    }
  }

  private class reference_remove implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      callbackContext.success();
    }
  }

  private class reference_set implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      callbackContext.success();
    }
  }

  private class reference_setPriority implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      callbackContext.success();
    }
  }

  private class reference_setWithPriority implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      callbackContext.success();
    }
  }

  private class reference_transaction implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      callbackContext.success();
    }
  }

  private class reference_onTransactionCallback implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      callbackContext.success();
    }
  }

  private class datareference_updatebase_goOffline implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      callbackContext.success();
    }
  }

  private class query_endAt implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      callbackContext.success();
    }
  }

  private class query_equalTo implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      callbackContext.success();
    }
  }

  private class query_limitToFirst implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      callbackContext.success();
    }
  }

  private class query_limitToLast implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      callbackContext.success();
    }
  }

  private class query_off implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      callbackContext.success();
    }
  }

  private class query_on implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      callbackContext.success();
    }
  }

  private class query_once implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      callbackContext.success();
    }
  }

  private class query_orderByChild implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      callbackContext.success();
    }
  }

  private class query_orderByKey implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      callbackContext.success();
    }
  }

  private class query_orderByPriority implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      callbackContext.success();
    }
  }

  private class query_orderByValue implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      callbackContext.success();
    }
  }

  private class query_startAt implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      callbackContext.success();
    }
  }

}
