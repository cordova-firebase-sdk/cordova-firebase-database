#import "CordovaFirebaseDatabase.h"

@implementation CordovaFirebaseDatabase
- (void)pluginInitialize
{
  self.DBs = [NSMutableDictionary dictionary];

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


  // Hack:
  // In order to load the plugin instance of the same class but different names,
  // register the map plugin instance into the pluginObjects directly.
  if ([pluginMap respondsToSelector:@selector(setViewController:)]) {
    [pluginMap setViewController:cdvViewController];
  }
  if ([pluginMap respondsToSelector:@selector(setCommandDelegate:)]) {
    [pluginMap setCommandDelegate:cdvViewController.commandDelegate];
  }
  [cdvViewController.pluginObjects setObject:pluginMap forKey:mapId];
  [cdvViewController.pluginsMap setValue:mapId forKey:mapId];
  [pluginMap pluginInitialize];

  [self.viewPlugins setObject:pluginMap forKey:mapId];



  [self.DBs setObject:database forKey:instanceId];

  CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
  [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}


@end
