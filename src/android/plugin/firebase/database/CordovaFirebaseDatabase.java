package plugin.firebase.database;

import android.content.Context;
import android.util.Log;

import com.google.firebase.FirebaseApp;
import com.google.firebase.database.FirebaseDatabase;

import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

import org.apache.cordova.CordovaWebView;
import org.apache.cordova.PluginEntry;
import org.apache.cordova.PluginManager;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Hashtable;
import java.util.Iterator;
import java.util.Map;

import plugin.firebase.core.CordovaFirebaseCore;
import plugin.firebase.core.FirebaseAppPlugin;
import plugin.firebase.core.IActionHandler;

/**
 * This class echoes a string called from JavaScript.
 */
public class CordovaFirebaseDatabase extends CordovaPlugin {


    public Map<String, IActionHandler> handlers = new Hashtable<>();
    public Map<String, FirebaseApp> fireDBs = new Hashtable<>();
    private Context context;
    private PluginManager pluginManager;


    @Override
    public void initialize(final CordovaInterface cordova, final CordovaWebView webView) {
        super.initialize(cordova, webView);

        pluginManager = webView.getPluginManager();
    }

    @Override
    protected void pluginInitialize() {
        this.context = cordova.getContext();
        this.handlers.put("newInstance", new NewInstance());
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

    private class NewInstance implements IActionHandler {

        @Override
        public void handle(JSONArray args, CallbackContext callbackContext) throws JSONException {

            JSONObject options = args.getJSONObject(0);
            String instanceId = options.getString("id");
            String appId = options.getString("appId");
            String name = options.getString("name");

            // TODO: create app using options
            // FirebaseOptions.Builder builder = new FirebaseOptions.Builder();
            // FirebaseOptions appOptions = builder.build();
            // FirebaseApp app = FirebaseApp.initializeApp(context, appOptions, name);

            Iterator<PluginEntry> iterator = pluginManager.getPluginEntries().iterator();
            CordovaFirebaseCore firebaseCorePlugin = null;
            PluginEntry entry;
            while (iterator.hasNext()) {
                entry = iterator.next();
                if (entry.service.equals("CordovaFirebaseCore") && entry.plugin instanceof CordovaFirebaseCore) {
                    firebaseCorePlugin = (CordovaFirebaseCore) entry.plugin;
                    break;
                }
            }

            FirebaseApp app = null;
            if (firebaseCorePlugin != null) {
                entry = firebaseCorePlugin.plugins.get(appId);
                FirebaseAppPlugin appPlugin = (FirebaseAppPlugin)entry.plugin;
                app = appPlugin.app;
            }

            FirebaseDatabase database = FirebaseDatabase.getInstance(app);


            // Create an instance of FirebaseApp
            FirebaseApp app = FirebaseApp.initializeApp(context);

            // Create an instance of FireBaseAppPlugin
            FirebaseAppPlugin appPlugin = new FirebaseAppPlugin(app);
            appPlugin.privateInitialize(instanceId, cordova, webView, null);
            appPlugin.initialize(cordova, webView);

            // Register as new plugin
            // (plugin name is "instanceId" variable.
            PluginEntry pluginEntry = new PluginEntry(instanceId, appPlugin);
            plugins.put(instanceId, pluginEntry);
            pluginManager.addService(pluginEntry);

            callbackContext.success();
        }
    }
}
