#import "FirebaseDatabasePlugin.h"

@implementation FirebaseDatabasePlugin

- (void)pluginInitialize
{
  [super pluginInitialize];
}

- (void)pluginInitializeWithFIRDatabase:(FIRDatabase*)databaseRef  andPluginId:(NSString *)pluginId
{
  self.database = databaseRef;
  self.semaphore = dispatch_semaphore_create(0);
  self.objects = [NSMutableDictionary dictionary];
  self.jsCallbackHolder = [NSMutableDictionary dictionary];
  self.pluginId = pluginId;
  
}

- (void)execJS: (NSString *)jsString {
  CDVViewController *viewCtl = (CDVViewController *)self.viewController;
  if ([viewCtl.webView respondsToSelector:@selector(stringByEvaluatingJavaScriptFromString:)]) {
      [viewCtl.webView performSelector:@selector(stringByEvaluatingJavaScriptFromString:) withObject:jsString];
  } else if ([viewCtl.webView respondsToSelector:@selector(evaluateJavaScript:completionHandler:)]) {
      [viewCtl.webView performSelector:@selector(evaluateJavaScript:completionHandler:) withObject:jsString withObject:nil];
  }
}


- (NSString *)jsonStringify: (NSDictionary*)dictionary error:(NSError **)error {

  NSData *jsonData = [NSJSONSerialization dataWithJSONObject:dictionary options:0 error:error];

  if (jsonData) {
    return [[[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding] compressToBase64];
  } else {
    return nil;
  }
}
- (NSDictionary *)jsonParse: (NSString*)serializedStr error:(NSError **)error {
  if (!serializedStr || [serializedStr isEqualToString:@""]) {
    return nil;
  }

  serializedStr = [serializedStr decompressFromBase64];
  NSData *jsonData = [serializedStr dataUsingEncoding:NSUTF8StringEncoding];
  NSDictionary *result = [NSJSONSerialization JSONObjectWithData:jsonData options:0 error:error];
  return result;
}



//---------------------------------------------------------------------------------
// Database.goOffline
// https://firebase.google.com/docs/reference/js/firebase.database.Database#goOffline
//---------------------------------------------------------------------------------
- (void)database_goOffline:(CDVInvokedUrlCommand*)command {
  NSLog(@"---->[ios] database.goOffline()");
  [self.database goOffline];

  CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
  [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}


//---------------------------------------------------------------------------------
// Database.goOnline
// https://firebase.google.com/docs/reference/js/firebase.database.Database#goOnline
//---------------------------------------------------------------------------------
- (void)database_goOnline:(CDVInvokedUrlCommand*)command {
  NSLog(@"---->[ios] database.goOnline()");
  [self.database goOnline];

  CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
  [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}


//---------------------------------------------------------------------------------
// Database.ref
// https://firebase.google.com/docs/reference/js/firebase.database.Database#ref
//---------------------------------------------------------------------------------
- (void)database_ref:(CDVInvokedUrlCommand*)command
{
  NSDictionary *options = [command.arguments objectAtIndex:0];
  NSLog(@"---->[ios] database.ref() %@", options);
  
  FIRDatabaseReference *ref;
  if ([options objectForKey:@"path"]) {
    ref = [self.database referenceWithPath:[options objectForKey:@"path"]];
  } else {
    ref = [self.database reference];
  }
  [self.objects setObject:ref forKey:[options objectForKey:@"id"]];

  CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
  [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}



/******************************************
 * Methods for OnDisconnect class
 *****************************************/

//---------------------------------------------------------------------------------
// onDisconnect.cancel
// https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#cancel
//---------------------------------------------------------------------------------
- (void)onDisconnect_cancel:(CDVInvokedUrlCommand*)command
{
  NSDictionary *options = [command.arguments objectAtIndex:0];
  NSLog(@"---->[ios] onDisconnect.cancel() %@", options);
  
  NSString *onDisconnectId = [options objectForKey:@"targetId"];
  NSString *refId = [self.objects objectForKey:onDisconnectId];
  if (refId) {
    FIRDatabaseReference *ref = [self.objects objectForKey:refId];
    
    [ref cancelDisconnectOperationsWithCompletionBlock:^(NSError * _Nullable error, FIRDatabaseReference * _Nonnull ref) {
      CDVPluginResult* pluginResult;
      if (error) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[error localizedDescription]];
      } else {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
      }
      [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
  } else {
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
  }

}

//---------------------------------------------------------------------------------
// onDisconnect.remove
// https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#remove
//---------------------------------------------------------------------------------
- (void)onDisconnect_remove:(CDVInvokedUrlCommand*)command
{
  NSDictionary *options = [command.arguments objectAtIndex:0];
  NSLog(@"---->[ios] onDisconnect.remove() %@", options);
  
  NSString *onDisconnectId = [options objectForKey:@"targetId"];
  NSString *refId = [self.objects objectForKey:onDisconnectId];
  if (refId) {
    FIRDatabaseReference *ref = [self.objects objectForKey:refId];
    
    [ref onDisconnectRemoveValueWithCompletionBlock:^(NSError * _Nullable error, FIRDatabaseReference * _Nonnull ref) {
      CDVPluginResult* pluginResult;
      if (error) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[error localizedDescription]];
      } else {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
      }
      [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
  } else {
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
  }

}


//---------------------------------------------------------------------------------
// onDisconnect.set
// https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#set
//---------------------------------------------------------------------------------
- (void)onDisconnect_set:(CDVInvokedUrlCommand*)command
{
  NSDictionary *options = [command.arguments objectAtIndex:0];
  NSLog(@"---->[ios] onDisconnect.set() %@", options);
  
  NSString *onDisconnectId = [options objectForKey:@"targetId"];
  NSString *refId = [self.objects objectForKey:onDisconnectId];
  if (refId) {
    FIRDatabaseReference *ref = [self.objects objectForKey:refId];
    
    NSError *error;
    NSDictionary *value = [self jsonParse:[options objectForKey:@"value"] error:&error];
    if (error) {
      CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[error localizedDescription]];
      [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
      return;
    }
    
    [ref onDisconnectSetValue:value withCompletionBlock:^(NSError * _Nullable error, FIRDatabaseReference * _Nonnull ref) {
      CDVPluginResult* pluginResult;
      if (error) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[error localizedDescription]];
      } else {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
      }
      [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
  } else {
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
  }

}


//---------------------------------------------------------------------------------
// onDisconnect.setWithPriority
// https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#setWithPriority
//---------------------------------------------------------------------------------
- (void)onDisconnect_setWithPriority:(CDVInvokedUrlCommand*)command
{
  NSDictionary *options = [command.arguments objectAtIndex:0];
  NSLog(@"---->[ios] onDisconnect.setWithPriority() %@", options);
  
  NSString *onDisconnectId = [options objectForKey:@"targetId"];
  NSString *refId = [self.objects objectForKey:onDisconnectId];
  if (refId) {
    FIRDatabaseReference *ref = [self.objects objectForKey:refId];
    
    NSError *error;
    NSDictionary *value = [self jsonParse:[options objectForKey:@"value"] error:&error];
    if (error) {
      CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[error localizedDescription]];
      [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
      return;
    }
    
    id priority = [options objectForKey:@"priority"];
    
    [ref onDisconnectSetValue:value andPriority:priority withCompletionBlock:^(NSError * _Nullable error, FIRDatabaseReference * _Nonnull ref) {
      CDVPluginResult* pluginResult;
      if (error) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[error localizedDescription]];
      } else {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
      }
      [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
  } else {
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
  }


}




//---------------------------------------------------------------------------------
// onDisconnect.update
// https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#update
//---------------------------------------------------------------------------------
- (void)onDisconnect_update:(CDVInvokedUrlCommand*)command
{
  NSDictionary *options = [command.arguments objectAtIndex:0];
  NSLog(@"---->[ios] onDisconnect.update() %@", options);
  
  NSString *onDisconnectId = [options objectForKey:@"targetId"];
  NSString *refId = [self.objects objectForKey:onDisconnectId];
  if (refId) {
    FIRDatabaseReference *ref = [self.objects objectForKey:refId];
    
    NSError *error;
    NSDictionary *value = [self jsonParse:[options objectForKey:@"values"] error:&error];
    if (error) {
      CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[error localizedDescription]];
      [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
      return;
    }
    
    [ref onDisconnectUpdateChildValues:value withCompletionBlock:^(NSError * _Nullable error, FIRDatabaseReference * _Nonnull ref) {
      CDVPluginResult* pluginResult;
      if (error) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[error localizedDescription]];
      } else {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
      }
      [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
  } else {
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
  }

}



/*******************************************************************************
 * Methods for Reference class
 ******************************************************************************/

//---------------------------------------------------------------------------------
// Reference.child
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#child
//---------------------------------------------------------------------------------
- (void)reference_child:(CDVInvokedUrlCommand*)command
{
  NSDictionary *options = [command.arguments objectAtIndex:0];
  NSLog(@"---->[ios] Reference.child() %@", options);
  
  NSString *refId = [options objectForKey:@"targetId"];
  FIRDatabaseReference *ref = [self.objects objectForKey:refId];
  NSString *path = [options objectForKey:@"path"];
  FIRDatabaseReference *childRef = [ref child:path];
  
  NSString *childId = [options objectForKey:@"childId"];
  [self.objects setObject:childRef forKey:childId];

  CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
  [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];

}



//---------------------------------------------------------------------------------
// Reference.onDisconnect
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#onDisconnect
//---------------------------------------------------------------------------------
- (void)reference_onDisconnect:(CDVInvokedUrlCommand*)command
{
  NSDictionary *options = [command.arguments objectAtIndex:0];
  NSLog(@"---->[ios] Reference.onDisconnect() %@", options);
  
  NSString *refId = [options objectForKey:@"targetId"];
  NSString *onDisconnectId = [options objectForKey:@"onDisconnectId"];
  [self.objects setObject:refId forKey:onDisconnectId];

  CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
  [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];

}


//---------------------------------------------------------------------------------
// Reference.push
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#push
//---------------------------------------------------------------------------------
- (void)reference_push:(CDVInvokedUrlCommand*)command
{
  NSDictionary *options = [command.arguments objectAtIndex:0];
  NSLog(@"---->[ios] reference.push() %@", options);
  
  NSString *refId = [options objectForKey:@"targetId"];
  FIRDatabaseReference *ref = [self.objects objectForKey:refId];
  FIRDatabaseReference *thenableRef = [ref childByAutoId];
  
  NSString *newId = [options objectForKey:@"newId"];
  [self.objects setObject:thenableRef forKey:newId];
  
  if ([options objectForKey:@"value"]) {
    NSError *error;
    NSDictionary *value = [self jsonParse:[options objectForKey:@"value"] error:&error];
    if (error) {
      CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[error localizedDescription]];
      [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
      return;
    }
    
    [thenableRef setValue:value withCompletionBlock:^(NSError * _Nullable error, FIRDatabaseReference * _Nonnull ref) {
      CDVPluginResult* pluginResult;
      if (error) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[error localizedDescription]];
      } else {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
      }
      [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
  } else {
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
  }

}


//---------------------------------------------------------------------------------
// Reference.remove
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#remove
//---------------------------------------------------------------------------------
- (void)reference_remove:(CDVInvokedUrlCommand*)command
{
  NSDictionary *options = [command.arguments objectAtIndex:0];
  NSLog(@"---->[ios] reference.remove() %@", options);
  
  NSString *refId = [options objectForKey:@"targetId"];
  FIRDatabaseReference *ref = [self.objects objectForKey:refId];
  
  [ref removeValueWithCompletionBlock:^(NSError * _Nullable error, FIRDatabaseReference * _Nonnull ref) {
    CDVPluginResult* pluginResult;
    if (error) {
      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[error localizedDescription]];
    } else {
      [self.objects removeObjectForKey:refId];
      
      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    }
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
  }];

}


//---------------------------------------------------------------------------------
// Reference.set
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#set
//---------------------------------------------------------------------------------
- (void)reference_set:(CDVInvokedUrlCommand*)command
{
  NSDictionary *options = [command.arguments objectAtIndex:0];
  NSLog(@"---->[ios] reference.set() %@", options);
  
  NSString *refId = [options objectForKey:@"targetId"];
  FIRDatabaseReference *ref = [self.objects objectForKey:refId];
  
  NSError *error;
  NSDictionary *value = [self jsonParse:[options objectForKey:@"data"] error:&error];
  if (error) {
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[error localizedDescription]];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    return;
  }
  
  [ref setValue:value withCompletionBlock:^(NSError * _Nullable error, FIRDatabaseReference * _Nonnull ref) {
    CDVPluginResult* pluginResult;
    if (error) {
      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[error localizedDescription]];
    } else {
      [self.objects removeObjectForKey:refId];
      
      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    }
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
  }];

}


//---------------------------------------------------------------------------------
// Reference.setPriority
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#setPriority
//---------------------------------------------------------------------------------
- (void)reference_setPriority:(CDVInvokedUrlCommand*)command
{
  NSDictionary *options = [command.arguments objectAtIndex:0];
  NSLog(@"---->[ios] reference.setPriority() %@", options);
  
  NSString *refId = [options objectForKey:@"targetId"];
  FIRDatabaseReference *ref = [self.objects objectForKey:refId];
  
  id priority = [options objectForKey:@"priority"];
  
  [ref setPriority:priority withCompletionBlock:^(NSError * _Nullable error, FIRDatabaseReference * _Nonnull ref) {
    CDVPluginResult* pluginResult;
    if (error) {
      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[error localizedDescription]];
    } else {
      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    }
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
  }];
}

//---------------------------------------------------------------------------------
// Reference.setWithPriority
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#setWithPriority
//---------------------------------------------------------------------------------
- (void)reference_setWithPriority:(CDVInvokedUrlCommand*)command
{
  NSDictionary *options = [command.arguments objectAtIndex:0];
  NSLog(@"---->[ios] reference.setWithPriority() %@", options);
  
  NSString *refId = [options objectForKey:@"targetId"];
  FIRDatabaseReference *ref = [self.objects objectForKey:refId];
  
  NSError *error;
  NSDictionary *value = [self jsonParse:[options objectForKey:@"data"] error:&error];
  if (error) {
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[error localizedDescription]];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    return;
  }
  id priority = [options objectForKey:@"priority"];
  
  [ref setValue:value andPriority:priority withCompletionBlock:^(NSError * _Nullable error, FIRDatabaseReference * _Nonnull ref) {
    CDVPluginResult* pluginResult;
    if (error) {
      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[error localizedDescription]];
    } else {
      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    }
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
  }];
}


//---------------------------------------------------------------------------------
// Reference.transaction
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#setWithPriority
//---------------------------------------------------------------------------------
- (void)reference_transaction:(CDVInvokedUrlCommand*)command
{
  NSDictionary *options = [command.arguments objectAtIndex:0];
  NSLog(@"---->[ios] reference.transaction() %@", options);
  
  NSString *refId = [options objectForKey:@"targetId"];
  FIRDatabaseReference *ref = [self.objects objectForKey:refId];
  
  __block NSString *eventName = [options objectForKey:@"eventName"];
  __block NSString *transactionId = [options objectForKey:@"transactionId"];
  BOOL withLocalEvents = NO;
  if ([options objectForKey:@"applyLocally"]) {
    withLocalEvents = YES;
  }
  
  [ref runTransactionBlock:^FIRTransactionResult * _Nonnull(FIRMutableData * _Nonnull currentData) {
    NSLog(@"--->currentData : %@", currentData);
    NSDictionary *currentValue = currentData.value;
    
    // current value -> serialized json strings
    NSError *error;
    __block NSString *serializedStr = [self jsonStringify: currentValue error:&error];
    if (error) {
      CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[error localizedDescription]];
      [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
      return [FIRTransactionResult abort];
    }
  
    
    @synchronized (self.semaphore) {
      // Execute JS callback
      dispatch_async(dispatch_get_main_queue(), ^{

        NSString* jsString = [NSString
                              stringWithFormat:@"javascript:cordova.fireDocumentEvent('%@', ['%@']);",
                              eventName, serializedStr];

        [self execJS:jsString];

      });
    
      // wait the result
      dispatch_semaphore_wait(self.semaphore, dispatch_time(DISPATCH_TIME_NOW, (uint64_t)(10 * NSEC_PER_SEC))); // Maximum wait 10sec
    }
  
    // returned value -> currentData.value
    NSString *serializedValue = [self.jsCallbackHolder objectForKey:transactionId];
    currentData.value = [self jsonParse: serializedValue error:&error];
    
    if (serializedValue) {
      [self.jsCallbackHolder removeObjectForKey:transactionId];
      return [FIRTransactionResult successWithValue:currentData];
    } else {
      return [FIRTransactionResult abort];
    }
      
  } andCompletionBlock:^(NSError * _Nullable error, BOOL committed, FIRDataSnapshot * _Nullable snapshot) {
    
    CDVPluginResult* pluginResult;
    if (error) {
      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[error localizedDescription]];
    } else if (!committed) {
      // abort
      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    } else {
    
      // Execute JS callback
      NSMutableDictionary *snapshotValues = [NSMutableDictionary dictionary];
      [snapshotValues setObject:snapshot.key forKey:@"key"];
    
      // exportVal -> serialized json strings
      [snapshotValues setObject:[self jsonStringify:[snapshot valueInExportFormat] error:&error] forKey:@"exportVal"];

      // value -> serialized json strings
      [snapshotValues setObject:[self jsonStringify:[snapshot value] error:&error] forKey:@"val"];

    
      [snapshotValues setObject:[NSNumber numberWithInteger:snapshot.childrenCount] forKey:@"numChildren"];
      [snapshotValues setObject:[NSNumber numberWithBool:snapshot.exists] forKey:@"exists"];
      [snapshotValues setObject:snapshot.priority forKey:@"getPriority"];
    
      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:snapshotValues];
    }
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    
    
  } withLocalEvents:withLocalEvents];
  
}

- (void)reference_onTransactionCallback:(CDVInvokedUrlCommand*)command {
  NSString *transactionId = [command.arguments objectAtIndex:0];
  
  @synchronized (self.jsCallbackHolder) {
    [self.jsCallbackHolder setObject:[NSString stringWithFormat:@"%@", [command.arguments objectAtIndex:1]] forKey:transactionId];
    dispatch_semaphore_signal(self.semaphore);
  }
}


//---------------------------------------------------------------------------------
// Reference.update
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#update
//---------------------------------------------------------------------------------
- (void)reference_update:(CDVInvokedUrlCommand*)command
{
  NSDictionary *options = [command.arguments objectAtIndex:0];
  NSLog(@"---->[ios] reference.update() %@", options);
  
  NSString *refId = [options objectForKey:@"targetId"];
  FIRDatabaseReference *ref = [self.objects objectForKey:refId];
  
  NSError *error;
  NSDictionary *value = [self jsonParse:[options objectForKey:@"data"] error:&error];
  if (error) {
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[error localizedDescription]];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    return;
  }
  
  [ref updateChildValues:value withCompletionBlock:^(NSError * _Nullable error, FIRDatabaseReference * _Nonnull ref) {
    CDVPluginResult* pluginResult;
    if (error) {
      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[error localizedDescription]];
    } else {
      [self.objects removeObjectForKey:refId];
      
      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    }
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
  }];

}


/*******************************************************************************
 * Methods for Query class
 ******************************************************************************/


//---------------------------------------------------------------------------------
// Query.endAt
// https://firebase.google.com/docs/reference/js/firebase.database.Query#endAt
//---------------------------------------------------------------------------------
- (void)query_endAt:(CDVInvokedUrlCommand*)command
{
  NSDictionary *options = [command.arguments objectAtIndex:0];
  NSLog(@"---->[ios] query.endAt() %@", options);
  
  NSString *refId = [options objectForKey:@"targetId"];
  FIRDatabaseReference *ref = [self.objects objectForKey:refId];
  
  NSString *queryId = [options objectForKey:@"queryId"];
  NSString *key = [options objectForKey:@"key"];
  
  NSString *valueStr = [options objectForKey:@"value"];
  NSData* jsonData = [valueStr dataUsingEncoding:NSUTF8StringEncoding];
  NSError *jsonError;
  NSDictionary *value = [NSJSONSerialization JSONObjectWithData:jsonData options:kNilOptions error:&jsonError];
  CDVPluginResult* pluginResult;
  if (jsonError) {
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[jsonError localizedDescription]];
  } else {
    FIRDatabaseQuery *query = [ref queryEndingAtValue:value childKey:key];
    [self.objects setObject:query forKey:queryId];
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
  }
  
  [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];

}


//---------------------------------------------------------------------------------
// Query.equalTo
// https://firebase.google.com/docs/reference/js/firebase.database.Query#equalTo
//---------------------------------------------------------------------------------
- (void)query_equalTo:(CDVInvokedUrlCommand*)command
{
  NSDictionary *options = [command.arguments objectAtIndex:0];
  NSLog(@"---->[ios] query.equalTo() %@", options);
  
  NSString *refId = [options objectForKey:@"targetId"];
  FIRDatabaseReference *ref = [self.objects objectForKey:refId];
  
  NSString *queryId = [options objectForKey:@"queryId"];
  NSString *key = [options objectForKey:@"key"];
  
  NSString *valueStr = [options objectForKey:@"value"];
  NSData* jsonData = [valueStr dataUsingEncoding:NSUTF8StringEncoding];
  NSError *jsonError;
  NSDictionary *value = [NSJSONSerialization JSONObjectWithData:jsonData options:kNilOptions error:&jsonError];
  CDVPluginResult* pluginResult;
  if (jsonError) {
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[jsonError localizedDescription]];
  } else {
    FIRDatabaseQuery *query = [ref queryEqualToValue:value childKey:key];
    [self.objects setObject:query forKey:queryId];
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
  }
  [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];

}


//---------------------------------------------------------------------------------
// Query.limitToFirst
// https://firebase.google.com/docs/reference/js/firebase.database.Query#limitToFirst
//---------------------------------------------------------------------------------
- (void)query_limitToFirst:(CDVInvokedUrlCommand*)command
{
  NSDictionary *options = [command.arguments objectAtIndex:0];
  NSLog(@"---->[ios] query.limitToFirst() %@", options);
  
  NSString *refId = [options objectForKey:@"targetId"];
  FIRDatabaseReference *ref = [self.objects objectForKey:refId];
  
  NSString *queryId = [options objectForKey:@"queryId"];
  NSInteger limit = (NSInteger)[[options objectForKey:@"limit"] intValue];
  
  FIRDatabaseQuery *query = [ref queryLimitedToFirst:limit];
  [self.objects setObject:query forKey:queryId];
  
  CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
  [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];

}


//---------------------------------------------------------------------------------
// Query.limitToLast
// https://firebase.google.com/docs/reference/js/firebase.database.Query#limitToLast
//---------------------------------------------------------------------------------
- (void)query_limitToLast:(CDVInvokedUrlCommand*)command
{
  NSDictionary *options = [command.arguments objectAtIndex:0];
  NSLog(@"---->[ios] query.limitToLast() %@", options);
  
  NSString *refId = [options objectForKey:@"targetId"];
  FIRDatabaseReference *ref = [self.objects objectForKey:refId];
  
  NSString *queryId = [options objectForKey:@"queryId"];
  NSInteger limit = (NSInteger)[[options objectForKey:@"limit"] intValue];
  
  FIRDatabaseQuery *query = [ref queryLimitedToLast:limit];
  [self.objects setObject:query forKey:queryId];
  
  CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
  [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];

}

//---------------------------------------------------------------------------------
// Query.off
// https://firebase.google.com/docs/reference/js/firebase.database.Query#off
//---------------------------------------------------------------------------------
- (void)query_off:(CDVInvokedUrlCommand*)command
{
  NSDictionary *options = [command.arguments objectAtIndex:0];
  NSLog(@"---->[ios] query.off() %@", options);
  
  NSString *refId = [options objectForKey:@"targetId"];
  FIRDatabaseReference *ref = [self.objects objectForKey:refId];
  
  NSString *listenerId = [options objectForKey:@"listenerId"];
  NSString *eventType = [options objectForKey:@"eventType"];
  if (listenerId) {
    NSNumber *listenerNumber = [self.objects objectForKey:listenerId];
    FIRDatabaseHandle handleId = [listenerNumber longValue];
    [ref removeObserverWithHandle:handleId];
    [self.objects removeObjectForKey:listenerId];
  
  } else if (eventType) {
  
    NSString *eventTypeStr = [options objectForKey:@"eventType"];
    FIRDataEventType eventType;
    if ([eventTypeStr isEqualToString:@"value"]) {
      eventType = FIRDataEventTypeValue;
    } else if ([eventTypeStr isEqualToString:@"child_added"]) {
      eventType = FIRDataEventTypeChildAdded;
    } else if ([eventTypeStr isEqualToString:@"child_changed"]) {
      eventType = FIRDataEventTypeChildChanged;
    } else if ([eventTypeStr isEqualToString:@"child_removed"]) {
      eventType = FIRDataEventTypeChildRemoved;
    } else if ([eventTypeStr isEqualToString:@"child_moved"]) {
      eventType = FIRDataEventTypeChildMoved;
    } else {
      CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Available eventType: 'value', 'child_added', 'child_changed', 'child_removed', and 'child_moved'"];
      [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
      return;
    }
    [ref removeObserverWithHandle:eventType];
    
  } else {
    [ref removeAllObservers];
  }
  
  CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
  [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];

}


//---------------------------------------------------------------------------------
// Query.on
// https://firebase.google.com/docs/reference/js/firebase.database.Query#on
//---------------------------------------------------------------------------------
- (void)query_on:(CDVInvokedUrlCommand*)command
{
  NSDictionary *options = [command.arguments objectAtIndex:0];
  NSLog(@"---->[ios] query.on() %@", options);
  
  NSString *refId = [options objectForKey:@"targetId"];
  FIRDatabaseReference *ref = [self.objects objectForKey:refId];
  
  NSString *eventTypeStr = [options objectForKey:@"eventType"];
  FIRDataEventType eventType;
  if ([eventTypeStr isEqualToString:@"value"]) {
    eventType = FIRDataEventTypeValue;
  } else if ([eventTypeStr isEqualToString:@"child_added"]) {
    eventType = FIRDataEventTypeChildAdded;
  } else if ([eventTypeStr isEqualToString:@"child_changed"]) {
    eventType = FIRDataEventTypeChildChanged;
  } else if ([eventTypeStr isEqualToString:@"child_removed"]) {
    eventType = FIRDataEventTypeChildRemoved;
  } else if ([eventTypeStr isEqualToString:@"child_moved"]) {
    eventType = FIRDataEventTypeChildMoved;
  } else {
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Available eventType: 'value', 'child_added', 'child_changed', 'child_removed', and 'child_moved'"];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    return;
  }
  
  FIRDatabaseHandle listener = [ref observeEventType:eventType withBlock:^(FIRDataSnapshot * _Nonnull snapshot) {

    // Execute JS callback
    [[NSOperationQueue mainQueue] addOperationWithBlock:^{
        NSMutableDictionary *snapshotValues = [NSMutableDictionary dictionary];
        [snapshotValues setObject:snapshot.key forKey:@"key"];
      
        NSError *error;
      
        // exportVal -> serialized json strings
        [snapshotValues setObject:[self jsonStringify: [snapshot valueInExportFormat] error:&error] forKey:@"exportVal"];
      
        // value -> serialized json strings
        [snapshotValues setObject:[self jsonStringify: [snapshot value] error:&error] forKey:@"val"];
      
        [snapshotValues setObject:[NSNumber numberWithInteger:snapshot.childrenCount] forKey:@"numChildren"];
        [snapshotValues setObject:[NSNumber numberWithBool:snapshot.exists] forKey:@"exists"];
        [snapshotValues setObject:snapshot.priority forKey:@"getPriority"];
      
        // snapshotValues -> serialized json strings
        NSString* jsString = [NSString
                              stringWithFormat:@"javascript:window.plugin.firebase.database._nativeCallback('%@', '%@', '%@', '%@', '%@');",
                              self.pluginId, [options objectForKey:@"listenerId"], eventTypeStr,
                              [self jsonStringify: snapshotValues error:&error],
                              snapshot.key];

        [self execJS:jsString];

    }];
  }];
  
  NSString *listenerId = [options objectForKey:@"listenerId"];
  [self.objects setObject:[NSNumber numberWithLong:listener] forKey:listenerId];
  
  CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
  [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];

}



//---------------------------------------------------------------------------------
// Query.once
// https://firebase.google.com/docs/reference/js/firebase.database.Query#once
//---------------------------------------------------------------------------------
- (void)query_once:(CDVInvokedUrlCommand*)command
{
  NSDictionary *options = [command.arguments objectAtIndex:0];
  NSLog(@"---->[ios] query.once() %@", options);
  
  NSString *refId = [options objectForKey:@"targetId"];
  FIRDatabaseReference *ref = [self.objects objectForKey:refId];
  
  NSString *eventTypeStr = [options objectForKey:@"eventType"];
  FIRDataEventType eventType;
  if ([eventTypeStr isEqualToString:@"value"]) {
    eventType = FIRDataEventTypeValue;
  } else if ([eventTypeStr isEqualToString:@"child_added"]) {
    eventType = FIRDataEventTypeChildAdded;
  } else if ([eventTypeStr isEqualToString:@"child_changed"]) {
    eventType = FIRDataEventTypeChildChanged;
  } else if ([eventTypeStr isEqualToString:@"child_removed"]) {
    eventType = FIRDataEventTypeChildRemoved;
  } else if ([eventTypeStr isEqualToString:@"child_moved"]) {
    eventType = FIRDataEventTypeChildMoved;
  } else {
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Available eventType: 'value', 'child_added', 'child_changed', 'child_removed', and 'child_moved'"];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    return;
  }
  
  [ref observeSingleEventOfType:eventType withBlock:^(FIRDataSnapshot * _Nonnull snapshot) {

    // Execute JS callback
    [[NSOperationQueue mainQueue] addOperationWithBlock:^{
    
      NSMutableDictionary *snapshotValues = [NSMutableDictionary dictionary];
      [snapshotValues setObject:snapshot.key forKey:@"key"];
    
      NSError *error;
    
      // exportVal -> serialized json strings
      [snapshotValues setObject:[self jsonStringify: [snapshot valueInExportFormat] error:&error] forKey:@"exportVal"];

      // value -> serialized json strings
      [snapshotValues setObject:[self jsonStringify: [snapshot value] error:&error] forKey:@"val"];
    
      [snapshotValues setObject:[NSNumber numberWithInteger:snapshot.childrenCount] forKey:@"numChildren"];
      [snapshotValues setObject:[NSNumber numberWithBool:snapshot.exists] forKey:@"exists"];
      [snapshotValues setObject:snapshot.priority forKey:@"getPriority"];
    
      CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:snapshotValues];
      [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];

    }];
  }];

}


//---------------------------------------------------------------------------------
// Query.orderByChild
// https://firebase.google.com/docs/reference/js/firebase.database.Query#orderByChild
//---------------------------------------------------------------------------------
- (void)query_orderByChild:(CDVInvokedUrlCommand*)command
{
  NSDictionary *options = [command.arguments objectAtIndex:0];
  NSLog(@"---->[ios] query.orderByChild() %@", options);
  
  NSString *refId = [options objectForKey:@"targetId"];
  FIRDatabaseReference *ref = [self.objects objectForKey:refId];
  
  NSString *path = [options objectForKey:@"path"];
  NSString *queryId = [options objectForKey:@"queryId"];
  FIRDatabaseQuery *query = [ref queryOrderedByChild:path];
  [self.objects setObject:query forKey:queryId];
  
  CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
  [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];

}


//---------------------------------------------------------------------------------
// Query.orderByKey
// https://firebase.google.com/docs/reference/js/firebase.database.Query#orderByKey
//---------------------------------------------------------------------------------
- (void)query_orderByKey:(CDVInvokedUrlCommand*)command
{
  NSDictionary *options = [command.arguments objectAtIndex:0];
  NSLog(@"---->[ios] query.orderByKey() %@", options);
  
  NSString *refId = [options objectForKey:@"targetId"];
  FIRDatabaseReference *ref = [self.objects objectForKey:refId];
  
  NSString *queryId = [options objectForKey:@"queryId"];
  FIRDatabaseQuery *query = [ref queryOrderedByKey];
  [self.objects setObject:query forKey:queryId];
  
  CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
  [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];

}


//---------------------------------------------------------------------------------
// Query.orderByPriority
// https://firebase.google.com/docs/reference/js/firebase.database.Query#orderByPriority
//---------------------------------------------------------------------------------
- (void)query_orderByPriority:(CDVInvokedUrlCommand*)command
{
  NSDictionary *options = [command.arguments objectAtIndex:0];
  NSLog(@"---->[ios] query.orderByPriority() %@", options);
  
  NSString *refId = [options objectForKey:@"targetId"];
  FIRDatabaseReference *ref = [self.objects objectForKey:refId];
  
  NSString *queryId = [options objectForKey:@"queryId"];
  FIRDatabaseQuery *query = [ref queryOrderedByValue];
  [self.objects setObject:query forKey:queryId];
  
  CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
  [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];

}


//---------------------------------------------------------------------------------
// Query.orderByValue
// https://firebase.google.com/docs/reference/js/firebase.database.Query#orderByValue
//---------------------------------------------------------------------------------
- (void)query_orderByValue:(CDVInvokedUrlCommand*)command
{
  NSDictionary *options = [command.arguments objectAtIndex:0];
  NSLog(@"---->[ios] query.orderByPriority() %@", options);
  
  NSString *refId = [options objectForKey:@"targetId"];
  FIRDatabaseReference *ref = [self.objects objectForKey:refId];
  
  NSString *queryId = [options objectForKey:@"queryId"];
  FIRDatabaseQuery *query = [ref queryOrderedByValue];
  [self.objects setObject:query forKey:queryId];
  
  CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
  [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];

}

//---------------------------------------------------------------------------------
// Query.startAt
// https://firebase.google.com/docs/reference/js/firebase.database.Query#startAt
//---------------------------------------------------------------------------------
- (void)query_startAt:(CDVInvokedUrlCommand*)command
{
  NSDictionary *options = [command.arguments objectAtIndex:0];
  NSLog(@"---->[ios] query.startAt() %@", options);
  
  NSString *refId = [options objectForKey:@"targetId"];
  FIRDatabaseReference *ref = [self.objects objectForKey:refId];
  
  NSString *queryId = [options objectForKey:@"queryId"];
  NSString *key = [options objectForKey:@"key"];
  
  NSString *valueStr = [options objectForKey:@"value"];
  NSData* jsonData = [valueStr dataUsingEncoding:NSUTF8StringEncoding];
  NSError *jsonError;
  NSDictionary *value = [NSJSONSerialization JSONObjectWithData:jsonData options:kNilOptions error:&jsonError];
  CDVPluginResult* pluginResult;
  if (jsonError) {
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[jsonError localizedDescription]];
  } else {
    FIRDatabaseQuery *query = [ref queryStartingAtValue:value childKey:key];
    [self.objects setObject:query forKey:queryId];
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
  }
  [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}
@end
