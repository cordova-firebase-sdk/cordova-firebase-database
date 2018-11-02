#import "CordovaFirebaseDatabase.h"

@implementation CordovaFirebaseDatabase
- (void)pluginInitialize
{
  [super pluginInitialize];
}
- (void)newInstance:(CDVInvokedUrlCommand*)command
{

  NSDictionary *options = [command.arguments objectAtIndex:0];
  NSString *instanceId = [options objectForKey:@"id"];
  NSString *appId = [options objectForKey:@"appId"];

  CDVViewController *cdvViewController = (CDVViewController*)self.viewController;
  CordovaFirebaseCore *firebaseCorePlugin = [cdvViewController getCommandInstance:@"CordovaFirebaseCore"];
  FirebaseAppPlugin *fireAppPlugin = [firebaseCorePlugin.apps objectForKey:appId];

  // Obtain reference to firebase DB
  FIRDatabase *database = [FIRDatabase databaseForApp:fireAppPlugin.app];
  @try {
    [database setPersistenceEnabled:YES];
  }
  @catch (NSException *e) {
    NSLog(@"--->ignore error = %@", e);
  }
  FirebaseDatabasePlugin *databasePlugin = [[FirebaseDatabasePlugin alloc] init];
  [databasePlugin pluginInitialize];

  // Hack:
  // In order to load the plugin instance of the same class but different names,
  // register the plugin instance into the pluginObjects directly.
  if ([databasePlugin respondsToSelector:@selector(setViewController:)]) {
    [databasePlugin setViewController:cdvViewController];
  }
  if ([databasePlugin respondsToSelector:@selector(setCommandDelegate:)]) {
    [databasePlugin setCommandDelegate:cdvViewController.commandDelegate];
  }
  [cdvViewController.pluginObjects setObject:databasePlugin forKey:instanceId];
  [cdvViewController.pluginsMap setValue:instanceId forKey:instanceId];
  [databasePlugin pluginInitializeWithFIRDatabase: database andPluginId: instanceId];
  

  CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
  [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}


@end
