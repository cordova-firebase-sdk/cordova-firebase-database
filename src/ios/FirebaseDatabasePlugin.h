
#import <Cordova/CDV.h>
@import Firebase;
#import <NSString+LZCompression.h>

#ifndef FirebaseDatabasePlugin_h
#define FirebaseDatabasePlugin_h

@interface FirebaseDatabasePlugin : CDVPlugin

@property (strong, nonatomic) NSString *pluginId;
@property (strong, atomic) NSMutableDictionary *objects;
@property (strong, atomic) dispatch_semaphore_t semaphore;
@property (strong, atomic) FIRDatabase *database;
@property (strong, atomic) NSMutableDictionary *jsCallbackHolder;

- (void)pluginInitializeWithFIRDatabase:(FIRDatabase*)databaseRef andPluginId:(NSString *)pluginId;
- (void)execJS: (NSString *)jsString;

- (void)database_goOffline:(CDVInvokedUrlCommand*)command;
- (void)database_goOnline:(CDVInvokedUrlCommand*)command;
- (void)database_ref:(CDVInvokedUrlCommand*)command;
- (void)onDisconnect_cancel:(CDVInvokedUrlCommand*)command;
- (void)onDisconnect_remove:(CDVInvokedUrlCommand*)command;
- (void)onDisconnect_set:(CDVInvokedUrlCommand*)command;
- (void)onDisconnect_setWithPriority:(CDVInvokedUrlCommand*)command;
- (void)onDisconnect_update:(CDVInvokedUrlCommand*)command;
- (void)reference_child:(CDVInvokedUrlCommand*)command;
- (void)reference_onDisconnect:(CDVInvokedUrlCommand*)command;
- (void)reference_push:(CDVInvokedUrlCommand*)command;
- (void)reference_remove:(CDVInvokedUrlCommand*)command;
- (void)reference_set:(CDVInvokedUrlCommand*)command;
- (void)reference_setPriority:(CDVInvokedUrlCommand*)command;
- (void)reference_setWithPriority:(CDVInvokedUrlCommand*)command;
- (void)reference_transaction:(CDVInvokedUrlCommand*)command;
- (void)reference_onTransactionCallback:(CDVInvokedUrlCommand*)command;
- (void)reference_update:(CDVInvokedUrlCommand*)command;
- (void)query_endAt:(CDVInvokedUrlCommand*)command;
- (void)query_equalTo:(CDVInvokedUrlCommand*)command;
- (void)query_limitToFirst:(CDVInvokedUrlCommand*)command;
- (void)query_limitToLast:(CDVInvokedUrlCommand*)command;
- (void)query_off:(CDVInvokedUrlCommand*)command;
- (void)query_on:(CDVInvokedUrlCommand*)command;
- (void)query_once:(CDVInvokedUrlCommand*)command;
- (void)query_orderByChild:(CDVInvokedUrlCommand*)command;
- (void)query_orderByKey:(CDVInvokedUrlCommand*)command;
- (void)query_orderByPriority:(CDVInvokedUrlCommand*)command;
- (void)query_orderByValue:(CDVInvokedUrlCommand*)command;
- (void)query_startAt:(CDVInvokedUrlCommand*)command;
@end

#endif

