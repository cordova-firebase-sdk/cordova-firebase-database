#import "FirebaseDatabasePlugin.h"

@implementation FirebaseDatabasePlugin

- (void)pluginInitializeWithFIRDatabase:(FIRDatabase*)databaseRef  andPluginId:(NSString *)pluginId
{
  self.database = databaseRef;
  self.semaphore = dispatch_semaphore_create(0);
  self.objects = [NSMutableDictionary dictionary];
  self.jsCallbackHolder = [NSMutableDictionary dictionary];
  self.pluginId = pluginId;
  
}

- (void)execJS: (NSString *)jsString {
  if ([self.webView respondsToSelector:@selector(stringByEvaluatingJavaScriptFromString:)]) {
      [self.webView performSelector:@selector(stringByEvaluatingJavaScriptFromString:) withObject:jsString];
  } else if ([self.webView respondsToSelector:@selector(evaluateJavaScript:completionHandler:)]) {
      [self.webView performSelector:@selector(evaluateJavaScript:completionHandler:) withObject:jsString withObject:nil];
  }
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
    
    NSString *valueStr = [[[options objectForKey:@"value"] stringValue] decompressLZ];
    NSData* jsonData = [valueStr dataUsingEncoding:NSUTF8StringEncoding];
    NSError *jsonError;
    NSDictionary *value = [NSJSONSerialization JSONObjectWithData:jsonData options:kNilOptions error:&jsonError];
    if (jsonError) {
      CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[jsonError localizedDescription]];
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
    
    NSString *valueStr = [[[options objectForKey:@"value"] stringValue] decompressLZ];
    NSData* jsonData = [valueStr dataUsingEncoding:NSUTF8StringEncoding];
    NSError *jsonError;
    NSDictionary *value = [NSJSONSerialization JSONObjectWithData:jsonData options:kNilOptions error:&jsonError];
    if (jsonError) {
      CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[jsonError localizedDescription]];
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
    
    NSString *valueStr = [[[options objectForKey:@"value"] stringValue] decompressLZ];
    NSData* jsonData = [valueStr dataUsingEncoding:NSUTF8StringEncoding];
    NSError *jsonError;
    NSDictionary *value = [NSJSONSerialization JSONObjectWithData:jsonData options:kNilOptions error:&jsonError];
    if (jsonError) {
      CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[jsonError localizedDescription]];
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
  
  
  NSString *valueStr = [[[options objectForKey:@"value"] stringValue] decompressLZ];
  NSData* jsonData = [valueStr dataUsingEncoding:NSUTF8StringEncoding];
  NSError *jsonError;
  NSDictionary *value = [NSJSONSerialization JSONObjectWithData:jsonData options:kNilOptions error:&jsonError];
  [thenableRef setValue:value withCompletionBlock:^(NSError * _Nullable error, FIRDatabaseReference * _Nonnull ref) {
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
  
  NSString *valueStr = [[[options objectForKey:@"value"] stringValue] decompressLZ];
  NSData* jsonData = [valueStr dataUsingEncoding:NSUTF8StringEncoding];
  NSError *jsonError;
  NSDictionary *value = [NSJSONSerialization JSONObjectWithData:jsonData options:kNilOptions error:&jsonError];
  
  
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
  
  NSString *valueStr = [[[options objectForKey:@"value"] stringValue] decompressLZ];
  NSData* jsonData = [valueStr dataUsingEncoding:NSUTF8StringEncoding];
  NSError *jsonError;
  NSDictionary *value = [NSJSONSerialization JSONObjectWithData:jsonData options:kNilOptions error:&jsonError];
  if (jsonError) {
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[jsonError localizedDescription]];
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
  
  [[NSOperationQueue currentQueue] addOperationWithBlock:^{
    [ref runTransactionBlock:^FIRTransactionResult * _Nonnull(FIRMutableData * _Nonnull currentData) {
      @synchronized (self.semaphore) {
      
        // current value -> serialized json strings
        NSError *error;
        NSData *serialized = [NSJSONSerialization dataWithJSONObject:currentData.value options:kNilOptions error:&error];
        if (error) {
          CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[error localizedDescription]];
          [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
          return [FIRTransactionResult abort];
        }
        __block NSString* serializedStr = [[[NSString alloc] initWithData:serialized encoding:NSUTF8StringEncoding] compressLZ];
        
        // Execute JS callback
        [[NSOperationQueue mainQueue] addOperationWithBlock:^{

              NSString* jsString = [NSString
                                    stringWithFormat:@"javascript:cordova.fireDocumentEvent('%@', %@);",
                                    eventName, serializedStr];

              [self execJS:jsString];

          }];
        
          // wait the result
          dispatch_semaphore_wait(self.semaphore, dispatch_time(DISPATCH_TIME_NOW, (uint64_t)(10 * NSEC_PER_SEC))); // Maximum wait 10sec
        
          // returned value -> currentData.value
          currentData.value = [self.jsCallbackHolder objectForKey:transactionId];
          [self.jsCallbackHolder removeObjectForKey:transactionId];

          return [FIRTransactionResult successWithValue:currentData];
      }
    } andCompletionBlock:^(NSError * _Nullable error, BOOL committed, FIRDataSnapshot * _Nullable snapshot) {
      
      CDVPluginResult* pluginResult;
      if (error) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[error localizedDescription]];
      } else {
      
      
        // Execute JS callback
        NSMutableDictionary *snapshotValues = [NSMutableDictionary dictionary];
        [snapshotValues setObject:snapshot.key forKey:@"key"];
      
        // exportVal -> serialized json strings
        NSDictionary *exportVal = [snapshot valueInExportFormat];
        NSData *serializedExportValue = [NSJSONSerialization dataWithJSONObject:exportVal options:kNilOptions error:&error];
        if (error) {
          NSLog(@"--->JSON serialize(exportVal) error at reference.transaction: %@", error);
          return;
        }
        NSString *serializedExportValStr = [[[NSString init] initWithData:serializedExportValue] compressLZ];
        [snapshotValues setObject:serializedExportValStr forKey:@"exportVal"];

        // value -> serialized json strings
        NSDictionary *value = [snapshot value];
        NSData *serializedValue = [NSJSONSerialization dataWithJSONObject:value options:kNilOptions error:&error];
        if (error) {
          NSLog(@"--->JSON serialize(val) error at reference.transaction: %@", error);
          return;
        }
        NSString *serializedValueStr = [[[NSString init] initWithData:serializedValue] compressLZ];
        [snapshotValues setObject:serializedValueStr forKey:@"val"];
      
        [snapshotValues setObject:[NSNumber numberWithInteger:snapshot.childrenCount] forKey:@"numChildren"];
        [snapshotValues setObject:[NSNumber numberWithBool:snapshot.exists] forKey:@"exists"];
        [snapshotValues setObject:snapshot.priority forKey:@"getPriority"];
      
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:snapshotValues];
      }
      [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    } withLocalEvents:withLocalEvents];
  }];
  
}

- (void)reference_onTransactionCallback:(CDVInvokedUrlCommand*)command {
  NSString *transactionId = [[command.arguments objectAtIndex:0] stringValue];
  NSString *serializedValue = [[[command.arguments objectAtIndex:1] stringValue] decompressLZ];
  NSData* jsonData = [serializedValue dataUsingEncoding:NSUTF8StringEncoding];
  
  @synchronized (self.jsCallbackHolder) {
    [self.jsCallbackHolder setObject:jsonData forKey:transactionId];
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
  
  NSString *valueStr = [[[options objectForKey:@"value"] stringValue] decompressLZ];
  NSData* jsonData = [valueStr dataUsingEncoding:NSUTF8StringEncoding];
  NSError *jsonError;
  NSDictionary *value = [NSJSONSerialization JSONObjectWithData:jsonData options:kNilOptions error:&jsonError];
  
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
  
  NSString *valueStr = [[options objectForKey:@"value"] stringValue];
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
  
  NSString *valueStr = [[options objectForKey:@"value"] stringValue];
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
        NSDictionary *exportVal = [snapshot valueInExportFormat];
        NSData *serializedExportValue = [NSJSONSerialization dataWithJSONObject:exportVal options:kNilOptions error:&error];
        if (error) {
          NSLog(@"--->JSON serialize(exportVal) error at query.on: %@", error);
          return;
        }
        NSString *serializedExportValStr = [[[NSString init] initWithData:serializedExportValue] compressLZ];
        [snapshotValues setObject:serializedExportValStr forKey:@"exportVal"];

        // value -> serialized json strings
        NSDictionary *value = [snapshot value];
        NSData *serializedValue = [NSJSONSerialization dataWithJSONObject:value options:kNilOptions error:&error];
        if (error) {
          NSLog(@"--->JSON serialize(val) error at query.on: %@", error);
          return;
        }
        NSString *serializedValueStr = [[[NSString init] initWithData:serializedValue] compressLZ];
        [snapshotValues setObject:serializedValueStr forKey:@"val"];
      
        [snapshotValues setObject:[NSNumber numberWithInteger:snapshot.childrenCount] forKey:@"numChildren"];
        [snapshotValues setObject:[NSNumber numberWithBool:snapshot.exists] forKey:@"exists"];
        [snapshotValues setObject:snapshot.priority forKey:@"getPriority"];
      
        // snapshotValues -> serialized json strings
        NSData *serializedSnapshotValues = [NSJSONSerialization dataWithJSONObject:snapshotValues options:kNilOptions error:&error];
        if (error) {
          NSLog(@"--->JSON serialize(snapshotValues) error at query.on: %@", error);
          return;
        }
        NSString *serializedSnapshotValuesStr = [[[NSString init] initWithData:serializedSnapshotValues] compressLZ];

      
        NSString* jsString = [NSString
                              stringWithFormat:@"javascript:window.plugin.firebase.database._nativeCallback('%@', '%@', '%@', '%@', '%@');",
                              self.pluginId, refId, eventTypeStr, serializedSnapshotValuesStr, snapshot.key];

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
      NSDictionary *exportVal = [snapshot valueInExportFormat];
      NSData *serializedExportValue = [NSJSONSerialization dataWithJSONObject:exportVal options:kNilOptions error:&error];
      if (error) {
        NSLog(@"--->JSON serialize(exportVal) error at query.once: %@", error);
        return;
      }
      NSString *serializedExportValStr = [[[NSString init] initWithData:serializedExportValue] compressLZ];
      [snapshotValues setObject:serializedExportValStr forKey:@"exportVal"];

      // value -> serialized json strings
      NSDictionary *value = [snapshot value];
      NSData *serializedValue = [NSJSONSerialization dataWithJSONObject:value options:kNilOptions error:&error];
      if (error) {
        NSLog(@"--->JSON serialize(val) error at query.once: %@", error);
        return;
      }
      NSString *serializedValueStr = [[[NSString init] initWithData:serializedValue] compressLZ];
      [snapshotValues setObject:serializedValueStr forKey:@"val"];
    
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
  
  NSString *valueStr = [[options objectForKey:@"value"] stringValue];
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
