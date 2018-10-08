#import "FirebaseDatabasePlugin.h"

@implementation FirebaseDatabasePlugin

- (void)pluginInitialize
{

  if (![FIRApp defaultApp]) {
    [FIRApp configure];
  }

}

- (void)ref:(CDVInvokedUrlCommand*)command
{
  NSDictionary *options = [command.arguments objectAtIndex:0];
  NSLog(@"---->[broswer] database.ref() %@", options);

  CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
  [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}


@end
