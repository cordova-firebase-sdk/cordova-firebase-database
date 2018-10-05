package plugin.firebase.database;

import org.apache.cordova.CallbackContext;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class NewInstance implements IActionHandler {

  private CordovaFirebaseDatabase firedbPlugin;

  NewInstance(CordovaFirebaseDatabase pluginDatabase) {
    this.firedbPlugin = pluginDatabase;
  }

  @Override
  public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {
    JSONObject options = args.getJSONObject(0);
    String instanceId = options.getString("id");
    //firedbPlugin.fireDBs.put(instanceId ,new GeoFire(geofirePlugin.firebaseDB.getReference()));
    callbackContext.success();
  }

}
