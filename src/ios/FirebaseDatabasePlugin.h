
#import <Cordova/CDV.h>
@import Firebase;

#ifndef FirebaseDatabasePlugin_h
#define FirebaseDatabasePlugin_h

@interface FirebaseDatabasePlugin : CDVPlugin

@property (strong, atomic) NSMutableDictionary *objects;
@property (atomic) dispatch_semaphore_t semaphore;


- (void)ref:(CDVInvokedUrlCommand*)command;
@end

#endif
