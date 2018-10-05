#import "CordovaFirebaseDatabase.h"

@implementation CordovaFirebaseDatabase
- (void)pluginInitialize
{
  self.geoFireMap = [NSMutableDictionary dictionary];

  if (![FIRApp defaultApp]) {
    [FIRApp configure];
  }

  // Obtain reference to firebase DB
  self.firebaseRef = [[FIRDatabase database] reference];
}
- (void)newInstance:(CDVInvokedUrlCommand*)command
{

  NSDictionary *options = [command.arguments objectAtIndex:0];
  NSString *instanceId = [options objectForKey:@"id"];


  CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
  [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}


@end
