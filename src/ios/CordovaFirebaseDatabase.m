#import "CordovaFirebaseDatabase.h"

@implementation CordovaFirebaseDatabase
- (void)pluginInitialize
{
  [FIRApp configure];
  
}
- (void)newInstance:(CDVInvokedUrlCommand*)command
{

  NSDictionary *options = [command.arguments objectAtIndex:0];
  NSString *instanceId = [options objectForKey:@"id"];


  // Obtain reference to firebase DB
  FIRDatabase *database = [FIRDatabase database];
  @try {
    [database setPersistenceEnabled:YES];
  }
  @catch (NSException *e) {
    NSLog(@"--->ignore error = %@", e);
  }
  FirebaseDatabasePlugin *databasePlugin = [[FirebaseDatabasePlugin alloc] init];

  // Hack:
  // In order to load the plugin instance of the same class but different names,
  // register the FirebaseDatabasePlugin instance into the pluginObjects directly.
  CDVViewController *cdvViewController = (CDVViewController*)self.viewController;
  databasePlugin.commandDelegate = self.commandDelegate;
  [cdvViewController.pluginObjects setObject:databasePlugin forKey:instanceId];
  [cdvViewController.pluginsMap setValue:instanceId forKey:instanceId];
  [databasePlugin pluginInitializeWithFIRDatabase: database andPluginId: instanceId];
  
  FIRDatabaseReference *tmpRef = [database reference];
  NSString *url = [NSString stringWithFormat:@"%@", tmpRef];
  
  NSMutableDictionary *result = [NSMutableDictionary dictionary];
  [result setObject:url forKey:@"url"];


  CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:result];
  [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}


@end
