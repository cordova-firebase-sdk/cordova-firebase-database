#import "CordovaFirebaseDatabase.h"

@implementation CordovaFirebaseDatabase
- (void)pluginInitialize
{
  [super pluginInitialize];
}
- (void)newInstance:(CDVInvokedUrlCommand*)command
{

  // Prevent "THREAD WARNING" message
  [[NSOperationQueue mainQueue] addOperationWithBlock:^{
  
    NSDictionary *options = [command.arguments objectAtIndex:0];
    NSString *instanceId = [options objectForKey:@"id"];
    NSString *appName = [options objectForKey:@"appName"];

    FIRApp *app;
    if ([@"[DEFAULT]" isEqualToString:appName]) {
      app = FIRApp.defaultApp;
    } else {
      app = [FIRApp.allApps objectForKey:appName];
    }

    // Obtain reference to firebase DB
    FIRDatabase *database = [FIRDatabase databaseForApp:app];
    if (database.persistenceEnabled == NO) {
      @try {
        [database setPersistenceEnabled:YES];
      }
      @catch (NSException *e) {
        // safely ignore this error.
        e = nil;
      }
    }
    
    FirebaseDatabasePlugin *databasePlugin = [[FirebaseDatabasePlugin alloc] init];
    [databasePlugin pluginInitialize];

    // Hack:
    // In order to load the plugin instance of the same class but different names,
    // register the plugin instance into the pluginObjects directly.
    CDVViewController *cdvViewController = (CDVViewController*)self.viewController;
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
  }];
}


@end
