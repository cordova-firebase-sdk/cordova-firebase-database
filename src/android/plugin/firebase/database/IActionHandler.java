package plugin.firebase.database;

import org.apache.cordova.CallbackContext;
import org.json.JSONArray;
import org.json.JSONException;

public interface IActionHandler {
  void handle(JSONArray args, final CallbackContext callbackContext) throws JSONException;
}
