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
import plugin.firebase.core.FirebasePluginUtil;
import plugin.firebase.core.IActionHandler;

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
      final Object valueObj = FirebasePluginUtil.deserialize(serializedValue);

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


  //---------------------------------------------------------------------------------
  // onDisconnect.setWithPriority
  // https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#setWithPriority
  //---------------------------------------------------------------------------------
  private class onDisconnect_setWithPriority implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      JSONObject options = args.getJSONObject(0);

      Log.d(TAG, "[android] onDisconnect.setWithPriority()");

      String targetId = options.getString("targetId");
      String serializedValue = options.getString("value");
      final Object valueObj = FirebasePluginUtil.deserialize(serializedValue);

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

  //---------------------------------------------------------------------------------
  // onDisconnect.update
  // https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#update
  //---------------------------------------------------------------------------------
  private class onDisconnect_update implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      JSONObject options = args.getJSONObject(0);

      Log.d(TAG, "[android] onDisconnect.update()");

      String targetId = options.getString("targetId");
      String serializedValue = options.getString("value");
      JSONObject values = (JSONObject)FirebasePluginUtil.deserialize(serializedValue);

      Map<String, Object> valueObj = FirebasePluginUtil.Json2Map(values);


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





  /*******************************************************************************
   * Methods for Reference class
   ******************************************************************************/

  //---------------------------------------------------------------------------------
  // Reference.child
  // https://firebase.google.com/docs/reference/js/firebase.database.Reference#child
  //---------------------------------------------------------------------------------
  private class reference_child implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {
      Log.d(TAG, "[android] reference.child()");

      JSONObject options = args.getJSONObject(0);
      String targetId = options.getString("targetId");
      String childId = options.getString("childId");
      String path = options.getString("path");

      DatabaseReference ref = (DatabaseReference) objects.get(targetId);
      DatabaseReference childRef = ref.child(path);
      objects.put(childId, childRef);

      callbackContext.success();
    }
  }

  //---------------------------------------------------------------------------------
  // Reference.onDisconnect
  // https://firebase.google.com/docs/reference/js/firebase.database.Reference#onDisconnect
  //---------------------------------------------------------------------------------
  private class reference_onDisconnect implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      Log.d(TAG, "[android] reference.onDisconnect()");

      JSONObject options = args.getJSONObject(0);
      String targetId = options.getString("targetId");
      String onDisconnectId = options.getString("onDisconnectId");

      DatabaseReference ref = (DatabaseReference) objects.get(targetId);
      OnDisconnect onDisconnect = ref.onDisconnect();
      objects.put(onDisconnectId, onDisconnect);

      callbackContext.success();
    }
  }

  //---------------------------------------------------------------------------------
  // Reference.push
  // https://firebase.google.com/docs/reference/js/firebase.database.Reference#push
  //---------------------------------------------------------------------------------
  private class reference_push implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      Log.d(TAG, "[android] reference.push()");

      JSONObject options = args.getJSONObject(0);
      String targetId = options.getString("targetId");
      String onDisconnectId = options.getString("onDisconnectId");
      final String newId = options.getString("newId");
      String serializedValue = options.getString("value");
      JSONObject values = (JSONObject)FirebasePluginUtil.deserialize(serializedValue);

      DatabaseReference ref = (DatabaseReference) objects.get(targetId);

      DatabaseReference newRef = ref.push();
      objects.put(newId, newRef);
      final JSONObject results = new JSONObject();
      results.put("key", newRef.getKey());
      results.put("url", newRef.toString());

      if (values == null) {
        callbackContext.success();
      } else {
        ref.setValue(values, new DatabaseReference.CompletionListener() {
          @Override
          public void onComplete(@Nullable DatabaseError databaseError, @NonNull DatabaseReference databaseReference) {
            callbackContext.success(results);
          }
        });
      }

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
