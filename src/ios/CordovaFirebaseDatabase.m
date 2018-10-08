#import "CordovaFirebaseDatabase.h"

@implementation CordovaFirebaseDatabase
- (void)pluginInitialize
{

  if (![FIRApp defaultApp]) {
    [FIRApp configure];
  }

}
- (void)newInstance:(CDVInvokedUrlCommand*)command
{

  NSDictionary *options = [command.arguments objectAtIndex:0];
  NSString *instanceId = [options objectForKey:@"id"];


  // Obtain reference to firebase DB
  FIRDatabase *database = [FIRDatabase database];
  FirebaseDatabasePlugin *databasePlugin = [[FirebaseDatabasePlugin alloc] init];

  // Hack:
  // In order to load the plugin instance of the same class but different names,
  // register the FirebaseDatabasePlugin instance into the pluginObjects directly.
  CDVViewController *cdvViewController = (CDVViewController*)self.viewController;
  [cdvViewController.pluginObjects setObject:databasePlugin forKey:instanceId];
  [cdvViewController.pluginsMap setValue:instanceId forKey:instanceId];
  [databasePlugin pluginInitializeWithFIRDatabase: database andPluginId: instanceId];


  CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
  [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}


@end
