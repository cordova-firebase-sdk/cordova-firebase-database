package plugin.firebase.database;

import android.util.Log;

import com.google.firebase.FirebaseApp;
import com.google.firebase.database.FirebaseDatabase;

import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

import org.apache.cordova.CordovaWebView;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Hashtable;
import java.util.Map;

/**
 * This class echoes a string called from JavaScript.
 */
public class CordovaFirebaseDatabase extends CordovaPlugin {

    public FirebaseDatabase firebaseDB = FirebaseDatabase.getInstance();

    public Map<String, IActionHandler> handlers = new Hashtable<>();
    public Map<String, FirebaseApp> fireDBs = new Hashtable<>();

    @Override
    protected void pluginInitialize() {
        this.handlers.put("newInstance", new NewInstance(this));
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

}
