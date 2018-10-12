package plugin.firebase.database;

import android.content.Context;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.v4.app.NavUtils;
import android.util.Log;

import com.google.firebase.database.ChildEventListener;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.MutableData;
import com.google.firebase.database.OnDisconnect;
import com.google.firebase.database.Query;
import com.google.firebase.database.Transaction;
import com.google.firebase.database.ValueEventListener;

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
  private final Map<String, String> jsCallbackHolder = new ConcurrentHashMap<>();
  private final ConcurrentHashMap<String, ListenerHolder> listenerHolders = new ConcurrentHashMap<>();
  private Context context;
  private final Object semaphore = new Object();

  class ListenerHolder {
    ValueEventListener valueEventListener;
    ChildEventListener childEventListener;
    String eventType;
    boolean isValueEvent;
  }

  FirebaseDatabasePlugin(FirebaseDatabase firebaseDB) {
    this.database = firebaseDB;
  }


  @Override
  protected void pluginInitialize() {
    this.context = cordova.getContext();
    handlers.put("database_goOffline", new database_goOffline());
    handlers.put("database_goOnline", new database_goOnline());
    handlers.put("database_ref", new database_ref());
    handlers.put("onDisconnect_cancel", new onDisconnect_cancel());
    handlers.put("onDisconnect_set", new onDisconnect_set());
    handlers.put("onDisconnect_setWithPriority", new onDisconnect_setWithPriority());
    handlers.put("onDisconnect_update", new onDisconnect_update());
    handlers.put("reference_child", new reference_child());
    handlers.put("reference_onDisconnect", new reference_onDisconnect());
    handlers.put("reference_push", new reference_push());
    handlers.put("reference_remove", new reference_remove());
    handlers.put("reference_set", new reference_set());
    handlers.put("reference_setPriority", new reference_setPriority());
    handlers.put("reference_setWithPriority", new reference_setWithPriority());
    handlers.put("reference_transaction", new reference_transaction());
    handlers.put("reference_onTransactionCallback", new reference_onTransactionCallback());
    handlers.put("reference_update", new reference_update());
    handlers.put("query_endAt", new query_endAt());
    handlers.put("query_equalTo", new query_equalTo());
    handlers.put("query_limitToFirst", new query_limitToFirst());
    handlers.put("query_limitToLast", new query_limitToLast());
    handlers.put("query_off", new query_off());
    handlers.put("query_on", new query_on());
    handlers.put("query_orderByChild", new query_orderByChild());
    handlers.put("query_orderByKey", new query_orderByKey());
    handlers.put("query_orderByPriority", new query_orderByPriority());
    handlers.put("query_orderByValue", new query_orderByValue());
    handlers.put("query_startAt", new query_startAt());
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

  private void execJS(final String jsString) {
    cordova.getActivity().runOnUiThread(new Runnable() {
      @Override
      public void run() {
        webView.loadUrl(jsString);
      }
    });
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

      String serializedProperty = options.getString("priority");
      final Object propertyObj = FirebasePluginUtil.deserialize(serializedProperty);


      synchronized (objects) {
        if (objects.containsKey(targetId)) {
          final OnDisconnect onDisconnect = (OnDisconnect) objects.get(targetId);
          if (propertyObj == null || propertyObj instanceof String) {
            onDisconnect.setValue(valueObj, (String)propertyObj, new DatabaseReference.CompletionListener() {
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
          } else if (propertyObj instanceof Number) {

            onDisconnect.setValue(valueObj, (double) propertyObj, new DatabaseReference.CompletionListener() {
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

            if (databaseError != null) {
              Log.e(TAG, "ref.push() error\n" + databaseError.getDetails());
              callbackContext.error(databaseError.getMessage());
            } else {
              callbackContext.success(results);
            }
          }
        });
      }

    }
  }

  //---------------------------------------------------------------------------------
  // Reference.remove
  // https://firebase.google.com/docs/reference/js/firebase.database.Reference#remove
  //---------------------------------------------------------------------------------
  private class reference_remove implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      Log.d(TAG, "[android] reference.remove()");

      JSONObject options = args.getJSONObject(0);
      String targetId = options.getString("targetId");

      DatabaseReference ref = (DatabaseReference) objects.get(targetId);
      ref.removeValue(new DatabaseReference.CompletionListener() {
        @Override
        public void onComplete(@Nullable DatabaseError databaseError, @NonNull DatabaseReference databaseReference) {

          if (databaseError != null) {
            Log.e(TAG, "ref.remove() error\n" + databaseError.getDetails());
            callbackContext.error(databaseError.getMessage());
          } else {
            callbackContext.success();
          }
        }
      });

    }
  }

  //---------------------------------------------------------------------------------
  // Reference.set
  // https://firebase.google.com/docs/reference/js/firebase.database.Reference#set
  //---------------------------------------------------------------------------------
  private class reference_set implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      Log.d(TAG, "[android] reference.set()");

      JSONObject options = args.getJSONObject(0);
      String targetId = options.getString("targetId");
      String serializedValue = options.getString("data");
      Object valueObj = FirebasePluginUtil.deserialize(serializedValue);
      if (valueObj instanceof JSONObject) {
        valueObj = FirebasePluginUtil.Json2Map((JSONObject)valueObj);
      } else if (valueObj instanceof JSONArray) {
        valueObj = FirebasePluginUtil.JsonArray2Map((JSONArray)valueObj);
      }

      DatabaseReference ref = (DatabaseReference) objects.get(targetId);

      ref.setValue(valueObj, new DatabaseReference.CompletionListener() {
        @Override
        public void onComplete(@Nullable DatabaseError databaseError, @NonNull DatabaseReference databaseReference) {

          if (databaseError != null) {
            Log.e(TAG, "ref.set() error\n" + databaseError.getDetails());
            callbackContext.error(databaseError.getMessage());
          } else {
            callbackContext.success();
          }
        }
      });

    }
  }

  //---------------------------------------------------------------------------------
  // Reference.setPriority
  // https://firebase.google.com/docs/reference/js/firebase.database.Reference#setPriority
  //---------------------------------------------------------------------------------
  private class reference_setPriority implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      JSONObject options = args.getJSONObject(0);

      Log.d(TAG, "[android] ref.setPriority()");

      String targetId = options.getString("targetId");
      String serializedProperty = options.getString("priority");
      final Object propertyObj = FirebasePluginUtil.deserialize(serializedProperty);

      DatabaseReference ref = (DatabaseReference) objects.get(targetId);
      ref.setPriority(propertyObj, new DatabaseReference.CompletionListener() {
        @Override
        public void onComplete(@Nullable DatabaseError databaseError, @NonNull DatabaseReference databaseReference) {

          if (databaseError != null) {
            Log.e(TAG, "ref.setPriority() error\n" + databaseError.getDetails());
            callbackContext.error(databaseError.getMessage());
          } else {
            callbackContext.success();
          }
        }
      });

    }
  }

  //---------------------------------------------------------------------------------
  // Reference.setWithPriority
  // https://firebase.google.com/docs/reference/js/firebase.database.Reference#setWithPriority
  //---------------------------------------------------------------------------------
  private class reference_setWithPriority implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      JSONObject options = args.getJSONObject(0);

      Log.d(TAG, "[android] ref.setWithPriority()");

      String targetId = options.getString("targetId");
      String serializedValue = options.getString("data");
      Object valueObj = FirebasePluginUtil.deserialize(serializedValue);
      if (valueObj instanceof JSONObject) {
        valueObj = FirebasePluginUtil.Json2Map((JSONObject)valueObj);
      } else if (valueObj instanceof JSONArray) {
        valueObj = FirebasePluginUtil.JsonArray2Map((JSONArray)valueObj);
      }

      String serializedProperty = options.getString("priority");
      final Object propertyObj = FirebasePluginUtil.deserialize(serializedProperty);

      DatabaseReference ref = (DatabaseReference) objects.get(targetId);
      ref.setValue(valueObj, propertyObj, new DatabaseReference.CompletionListener() {
        @Override
        public void onComplete(@Nullable DatabaseError databaseError, @NonNull DatabaseReference databaseReference) {

          if (databaseError != null) {
            Log.e(TAG, "ref.setPriority() error\n" + databaseError.getDetails());
            callbackContext.error(databaseError.getMessage());
          } else {
            callbackContext.success();
          }
        }
      });
    }
  }

  //---------------------------------------------------------------------------------
  // Reference.transaction
  // https://firebase.google.com/docs/reference/js/firebase.database.Reference#transaction
  //---------------------------------------------------------------------------------
  private class reference_transaction implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      JSONObject options = args.getJSONObject(0);

      Log.d(TAG, "[android] ref.transaction()");

      boolean applyLocal = options.has("applyLocal") ? options.getBoolean("applyLocal") : true;

      final String eventName = options.getString("eventName");
      final String targetId = options.getString("targetId");
      final String transactionId = options.getString("transactionId");
      DatabaseReference ref = (DatabaseReference) objects.get(targetId);

      // Read value from database to synchronize localDB with remoteDB
      ref.addListenerForSingleValueEvent(new ValueEventListener() {
        @Override
        public void onDataChange(@NonNull DataSnapshot dataSnapshot) {

          // Then execute transaction.
          ref.runTransaction(new Transaction.Handler() {
            @NonNull
            @Override
            public Transaction.Result doTransaction(@NonNull MutableData mutableData) {

              String serializedValueStr = null;
              try {
                serializedValueStr = FirebasePluginUtil.serialize(mutableData.getValue());
              } catch (JSONException e) {
                e.printStackTrace();
                return Transaction.abort();
              }

              synchronized (semaphore) {
                execJS(String.format(
                    "javascript:cordova.fireDocumentEvent('%s', ['%s'])",
                    eventName, serializedValueStr));
                try {
                  semaphore.wait(10000);
                } catch (InterruptedException e) {
                  e.printStackTrace();
                  return Transaction.abort();
                }
              }
              if (jsCallbackHolder.containsKey(transactionId)) {
                String serializedValue = jsCallbackHolder.get(transactionId);
                Object valueObj = FirebasePluginUtil.deserialize(serializedValue);
                try {
                  if (valueObj instanceof JSONObject) {
                    valueObj = FirebasePluginUtil.Json2Map((JSONObject) valueObj);
                  } else if (valueObj instanceof JSONArray) {
                    valueObj = FirebasePluginUtil.JsonArray2Map((JSONArray) valueObj);
                  }
                } catch (JSONException e) {
                  e.printStackTrace();
                  valueObj = valueObj + "";
                }

                mutableData.setValue(valueObj);
                jsCallbackHolder.remove(targetId);
                return Transaction.success(mutableData);
              } else {
                return Transaction.abort();
              }
            }

            @Override
            public void onComplete(@Nullable DatabaseError databaseError, boolean committed, @Nullable DataSnapshot dataSnapshot) {

              if (databaseError != null) {
                Log.e(TAG, "ref.transaction() error\n" + databaseError.getDetails());
                callbackContext.error(databaseError.getMessage());
              } else {

                try {

                  JSONObject snapshotValues = new JSONObject();
                  snapshotValues.put("key", dataSnapshot.getKey());
                  snapshotValues.put("exists", dataSnapshot.exists());
                  snapshotValues.put("exportVal", FirebasePluginUtil.serialize(dataSnapshot.getValue(true)));
                  snapshotValues.put("getPriority", dataSnapshot.getPriority());
                  snapshotValues.put("numChildren", dataSnapshot.getChildrenCount());
                  snapshotValues.put("vl", FirebasePluginUtil.serialize(dataSnapshot.getValue(false)));

                  JSONObject result = new JSONObject();
                  result.put("snapshot", snapshotValues);
                  result.put("committed", committed);

                  callbackContext.success(result);
                } catch (JSONException e) {
                  e.printStackTrace();
                  callbackContext.error(e.getMessage());
                }
              }
            }
          }, applyLocal);
        }

        @Override
        public void onCancelled(@NonNull DatabaseError databaseError) {

          callbackContext.error(databaseError.getMessage());
        }
      });


    }
  }


  private class reference_onTransactionCallback implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {
      String transactionId = args.getString(0);
      String valueStr = args.getString(1);
      Log.d(TAG, "--->transactionId " +transactionId);
      synchronized (jsCallbackHolder) {
        jsCallbackHolder.put(transactionId, valueStr);
      }
      synchronized (semaphore) {
        semaphore.notify();
      }
      callbackContext.success();
    }
  }


  //---------------------------------------------------------------------------------
  // Reference.update
  // https://firebase.google.com/docs/reference/js/firebase.database.Reference#update
  //---------------------------------------------------------------------------------
  private class reference_update implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      Log.d(TAG, "[android] reference.set()");

      JSONObject options = args.getJSONObject(0);
      String targetId = options.getString("targetId");
      String serializedValue = options.getString("data");
      JSONObject values = (JSONObject)FirebasePluginUtil.deserialize(serializedValue);
      Map<String, Object> valuesMap = FirebasePluginUtil.Json2Map(values);


      DatabaseReference ref = (DatabaseReference) objects.get(targetId);

      ref.updateChildren(valuesMap, new DatabaseReference.CompletionListener() {
        @Override
        public void onComplete(@Nullable DatabaseError databaseError, @NonNull DatabaseReference databaseReference) {

          if (databaseError != null) {
            Log.e(TAG, "ref.update() error\n" + databaseError.getDetails());
            callbackContext.error(databaseError.getMessage());
          } else {
            callbackContext.success();
          }
        }
      });

    }
  }








  /*******************************************************************************
   * Methods for Query class
   ******************************************************************************/

  //---------------------------------------------------------------------------------
  // Query.endAt
  // https://firebase.google.com/docs/reference/js/firebase.database.Query#endAt
  //---------------------------------------------------------------------------------
  private class query_endAt implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      Log.d(TAG, "[android] query.endAt()");

      JSONObject options = args.getJSONObject(0);
      String targetId = options.getString("targetId");
      String queryId = options.getString("queryId");
      String key = options.getString("key");
      String serializedValue = options.getString("value");
      Object value = FirebasePluginUtil.deserialize(serializedValue);

      Query query;
      Query ref_or_query = (Query) objects.get(targetId);
      if (key == null || key.isEmpty()) {
        if (value == null || String.class.isInstance(value)) {
          query = ref_or_query.endAt((String)value);
        } else if (Number.class.isInstance(value)) {
          query = ref_or_query.endAt((double)value);
        } else if (Boolean.class.isInstance(value)) {
          query = ref_or_query.endAt((boolean)value);
        } else {
          callbackContext.error("Value must be number, string, boolean, or null");
          return;
        }
      } else {

        if (value == null || String.class.isInstance(value)) {
          query = ref_or_query.endAt((String)value, key);
        } else if (Number.class.isInstance(value)) {
          query = ref_or_query.endAt((double)value, key);
        } else if (Boolean.class.isInstance(value)) {
          query = ref_or_query.endAt((boolean)value, key);
        } else {
          callbackContext.error("Value must be number, string, boolean, or null");
          return;
        }
      }
      objects.put(queryId, query);

      callbackContext.success();
    }
  }

  //---------------------------------------------------------------------------------
  // Query.equalTo
  // https://firebase.google.com/docs/reference/js/firebase.database.Query#limitToFirst
  //---------------------------------------------------------------------------------
  private class query_equalTo implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      Log.d(TAG, "[android] query.equalTo()");

      JSONObject options = args.getJSONObject(0);
      String targetId = options.getString("targetId");
      String queryId = options.getString("queryId");
      String key = options.getString("key");
      String serializedValue = options.getString("value");
      Object value = FirebasePluginUtil.deserialize(serializedValue);

      Query query;
      Query ref_or_query = (Query) objects.get(targetId);
      if (key == null || key.isEmpty()) {
        if (value == null || String.class.isInstance(value)) {
          query = ref_or_query.equalTo((String)value);
        } else if (Number.class.isInstance(value)) {
          query = ref_or_query.equalTo((double)value);
        } else if (Boolean.class.isInstance(value)) {
          query = ref_or_query.equalTo((boolean)value);
        } else {
          callbackContext.error("Value must be number, string, boolean, or null");
          return;
        }
      } else {

        if (value == null || String.class.isInstance(value)) {
          query = ref_or_query.equalTo((String)value, key);
        } else if (Number.class.isInstance(value)) {
          query = ref_or_query.equalTo((double)value, key);
        } else if (Boolean.class.isInstance(value)) {
          query = ref_or_query.equalTo((boolean)value, key);
        } else {
          callbackContext.error("Value must be number, string, boolean, or null");
          return;
        }
      }
      objects.put(queryId, query);

      callbackContext.success();
    }
  }

  //---------------------------------------------------------------------------------
  // Query.limitToFirst
  // https://firebase.google.com/docs/reference/js/firebase.database.Query#limitToFirst
  //---------------------------------------------------------------------------------
  private class query_limitToFirst implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      Log.d(TAG, "[android] query.equalTo()");

      JSONObject options = args.getJSONObject(0);
      String targetId = options.getString("targetId");
      String queryId = options.getString("queryId");
      int limit = options.getInt("limit");

      Query query;
      Query ref_or_query = (Query) objects.get(targetId);
      query = ref_or_query.limitToFirst(limit);
      objects.put(queryId, query);

      callbackContext.success();
    }
  }

  //---------------------------------------------------------------------------------
  // Query.limitToLast
  // https://firebase.google.com/docs/reference/js/firebase.database.Query#limitToLast
  //---------------------------------------------------------------------------------
  private class query_limitToLast implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      Log.d(TAG, "[android] query.equalTo()");

      JSONObject options = args.getJSONObject(0);
      String targetId = options.getString("targetId");
      String queryId = options.getString("queryId");
      int limit = options.getInt("limit");

      Query query;
      Query ref_or_query = (Query) objects.get(targetId);
      query = ref_or_query.limitToLast(limit);
      objects.put(queryId, query);

      callbackContext.success();
    }
  }

  private class query_off implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      Log.d(TAG, "[android] query.off()");

      JSONObject options = args.getJSONObject(0);
      String targetId = options.getString("targetId");
      JSONArray listenerIdSet = options.getJSONArray("listenerIdSet");

      Query ref_or_query = (Query)objects.get(targetId);
      String listenerId;
      ListenerHolder holder;
      for (int i = 0; i < listenerIdSet.length(); i++) {
        listenerId = listenerIdSet.getString(i);
        holder = listenerHolders.remove(listenerId);

        if (holder.isValueEvent) {
          ref_or_query.removeEventListener(holder.valueEventListener);
        } else {
          ref_or_query.removeEventListener(holder.childEventListener);
        }
        holder = null;
      }

      callbackContext.success();
    }
  }

  //---------------------------------------------------------------------------------
  // Query.on
  // https://firebase.google.com/docs/reference/js/firebase.database.Query#on
  //---------------------------------------------------------------------------------
  private class query_on implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      Log.d(TAG, "[android] query.on()");

      JSONObject options = args.getJSONObject(0);
      String targetId = options.getString("targetId");
      String eventType = options.getString("eventType");
      final String listenerId = options.getString("listenerId");


      Query ref_or_query = (Query) objects.get(targetId);
      if (eventType.equals("value")) {
        ValueEventListener valueEventListener = new ValueEventListener() {
          @Override
          public void onDataChange(@NonNull DataSnapshot dataSnapshot) {

            try {
              JSONObject snapshotValues = new JSONObject();
              snapshotValues.put("key", dataSnapshot.getKey());
              snapshotValues.put("exists", dataSnapshot.exists());
              snapshotValues.put("exportVal", FirebasePluginUtil.serialize(dataSnapshot.getValue(true)));
              snapshotValues.put("getPriority", dataSnapshot.getPriority());
              snapshotValues.put("numChildren", dataSnapshot.getChildrenCount());

              snapshotValues.put("val", FirebasePluginUtil.serialize(dataSnapshot.getValue(false)));

              execJS(String.format("javascript:window.plugin.firebase.database._nativeCallback('%s', '%s', '%s', ['%s']);",
                      getServiceName(), listenerId, eventType,
                      FirebasePluginUtil.serialize(snapshotValues)
              ));

            } catch (JSONException e) {
              e.printStackTrace();
            }

          }

          @Override
          public void onCancelled(@NonNull DatabaseError databaseError) {


          }
        };

        ListenerHolder holder = new ListenerHolder();
        holder.valueEventListener = valueEventListener;
        holder.eventType = eventType;
        holder.isValueEvent = true;
        listenerHolders.put(listenerId, holder);

        ref_or_query.addValueEventListener(valueEventListener);
      } else if (eventType.startsWith("child_")) {
        ChildEventListener childEventListener = new ChildEventListener() {
          @Override
          public void onChildAdded(@NonNull DataSnapshot dataSnapshot, @Nullable String prevChildKey) {

            try {
              JSONObject snapshotValues = new JSONObject();
              snapshotValues.put("key", dataSnapshot.getKey());
              snapshotValues.put("exists", dataSnapshot.exists());
              snapshotValues.put("exportVal", FirebasePluginUtil.serialize(dataSnapshot.getValue(true)));
              snapshotValues.put("getPriority", dataSnapshot.getPriority());
              snapshotValues.put("numChildren", dataSnapshot.getChildrenCount());
              snapshotValues.put("val", FirebasePluginUtil.serialize(dataSnapshot.getValue(false)));

              execJS(String.format("javascript:window.plugin.firebase.database._nativeCallback('%s', '%s', 'child_added', '%s', ['%s']);",
                      getServiceName(), listenerId,
                      FirebasePluginUtil.serialize(snapshotValues), prevChildKey
              ));

            } catch (JSONException e) {
              e.printStackTrace();
            }

          }

          @Override
          public void onChildChanged(@NonNull DataSnapshot dataSnapshot, @Nullable String prevChildKey) {

            try {
              JSONObject snapshotValues = new JSONObject();
              snapshotValues.put("key", dataSnapshot.getKey());
              snapshotValues.put("exists", dataSnapshot.exists());
              snapshotValues.put("exportVal", FirebasePluginUtil.serialize(dataSnapshot.getValue(true)));
              snapshotValues.put("getPriority", dataSnapshot.getPriority());
              snapshotValues.put("numChildren", dataSnapshot.getChildrenCount());
              snapshotValues.put("val", FirebasePluginUtil.serialize(dataSnapshot.getValue(false)));

              execJS(String.format("javascript:window.plugin.firebase.database._nativeCallback('%s', '%s', 'child_changed', '%s', ['%s']);",
                      getServiceName(), listenerId,
                      FirebasePluginUtil.serialize(snapshotValues), prevChildKey
              ));

            } catch (JSONException e) {
              e.printStackTrace();
            }

          }

          @Override
          public void onChildRemoved(@NonNull DataSnapshot dataSnapshot) {

            try {
              JSONObject snapshotValues = new JSONObject();
              snapshotValues.put("key", dataSnapshot.getKey());
              snapshotValues.put("exists", dataSnapshot.exists());
              snapshotValues.put("exportVal", FirebasePluginUtil.serialize(dataSnapshot.getValue(true)));
              snapshotValues.put("getPriority", dataSnapshot.getPriority());
              snapshotValues.put("numChildren", dataSnapshot.getChildrenCount());
              snapshotValues.put("val", FirebasePluginUtil.serialize(dataSnapshot.getValue(false)));

              execJS(String.format("javascript:window.plugin.firebase.database._nativeCallback('%s', '%s', 'child_removed', ['%s']);",
                      getServiceName(), listenerId,
                      FirebasePluginUtil.serialize(snapshotValues)
              ));

            } catch (JSONException e) {
              e.printStackTrace();
            }

          }

          @Override
          public void onChildMoved(@NonNull DataSnapshot dataSnapshot, @Nullable String prevChildKey) {

            try {
              JSONObject snapshotValues = new JSONObject();
              snapshotValues.put("key", dataSnapshot.getKey());
              snapshotValues.put("exists", dataSnapshot.exists());
              snapshotValues.put("exportVal", FirebasePluginUtil.serialize(dataSnapshot.getValue(true)));
              snapshotValues.put("getPriority", dataSnapshot.getPriority());
              snapshotValues.put("numChildren", dataSnapshot.getChildrenCount());
              snapshotValues.put("val", FirebasePluginUtil.serialize(dataSnapshot.getValue(false)));

              execJS(String.format("javascript:window.plugin.firebase.database._nativeCallback('%s', '%s', 'child_moved', ['%s']);",
                      getServiceName(), listenerId,
                      FirebasePluginUtil.serialize(snapshotValues)
              ));

            } catch (JSONException e) {
              e.printStackTrace();
            }
          }

          @Override
          public void onCancelled(@NonNull DatabaseError databaseError) {

//            execJS(String.format("javascript:window.plugin.firebase.database._nativeCallback('%s', '%s', 'cancelled');",
//                    getServiceName(), listenerId
//            ));
          }
        };
        ref_or_query.addChildEventListener(childEventListener);

        ListenerHolder holder = new ListenerHolder();
        holder.childEventListener = childEventListener;
        holder.eventType = eventType;
        holder.isValueEvent = true;
        listenerHolders.put(listenerId, holder);
      }

      callbackContext.success();
    }
  }


  private class query_orderByChild implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      Log.d(TAG, "[android] query.orderByChild()");

      JSONObject options = args.getJSONObject(0);
      String targetId = options.getString("targetId");
      String queryId = options.getString("queryId");
      String path = options.getString("path");

      Query ref_or_query = (Query) objects.get(targetId);
      Query query = ref_or_query.orderByChild(path);
      objects.put(queryId, query);

      callbackContext.success();
    }
  }

  private class query_orderByKey implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      Log.d(TAG, "[android] query.orderByKey()");

      JSONObject options = args.getJSONObject(0);
      String targetId = options.getString("targetId");
      String queryId = options.getString("queryId");

      Query ref_or_query = (Query) objects.get(targetId);
      Query query = ref_or_query.orderByKey();
      objects.put(queryId, query);

      callbackContext.success();
    }
  }

  private class query_orderByPriority implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      Log.d(TAG, "[android] query.orderByPriority()");

      JSONObject options = args.getJSONObject(0);
      String targetId = options.getString("targetId");
      String queryId = options.getString("queryId");

      Query ref_or_query = (Query) objects.get(targetId);
      Query query = ref_or_query.orderByPriority();
      objects.put(queryId, query);

      callbackContext.success();
    }
  }

  private class query_orderByValue implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      Log.d(TAG, "[android] query.orderByValue()");

      JSONObject options = args.getJSONObject(0);
      String targetId = options.getString("targetId");
      String queryId = options.getString("queryId");

      Query ref_or_query = (Query) objects.get(targetId);
      Query query = ref_or_query.orderByValue();
      objects.put(queryId, query);

      callbackContext.success();
    }
  }

  private class query_startAt implements IActionHandler {

    @Override
    public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

      Log.d(TAG, "[android] query.startAt()");

      JSONObject options = args.getJSONObject(0);
      String targetId = options.getString("targetId");
      String queryId = options.getString("queryId");
      String key = options.getString("key");
      String serializedValue = options.getString("value");
      Object value = FirebasePluginUtil.deserialize(serializedValue);

      Query query;
      Query ref_or_query = (Query) objects.get(targetId);
      if (key == null || key.isEmpty()) {
        if (value == null || String.class.isInstance(value)) {
          query = ref_or_query.startAt((String)value);
        } else if (Number.class.isInstance(value)) {
          query = ref_or_query.startAt((double)value);
        } else if (Boolean.class.isInstance(value)) {
          query = ref_or_query.startAt((boolean)value);
        } else {
          callbackContext.error("Value must be number, string, boolean, or null");
          return;
        }
      } else {

        if (value == null || String.class.isInstance(value)) {
          query = ref_or_query.startAt((String)value, key);
        } else if (Number.class.isInstance(value)) {
          query = ref_or_query.startAt((double)value, key);
        } else if (Boolean.class.isInstance(value)) {
          query = ref_or_query.startAt((boolean)value, key);
        } else {
          callbackContext.error("Value must be number, string, boolean, or null");
          return;
        }
      }
      objects.put(queryId, query);

      callbackContext.success();
    }
  }

}
