
#import <Cordova/CDV.h>
@import Firebase;
#import "FirebaseDatabasePlugin.h"

#ifndef CordovaFirebaseDatabase_h
#define CordovaFirebaseDatabase_h

@interface CordovaFirebaseDatabase : CDVPlugin

- (void)newInstance:(CDVInvokedUrlCommand*)command;
@end

#endif
