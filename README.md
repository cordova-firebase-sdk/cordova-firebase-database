![](https://travis-ci.org/cordova-firebase-sdk/cordova-firebase-database.svg?branch=master)

# cordova-firebase-database

`cordova-firebase-database` provides `much similar API` as the original [firebase realtime database API](https://firebase.google.com/docs/database/web/start?hl=en).
You can just modify your code **only a few points**.

For example, this is the original usage of `firebase database api`.

**[original]**
```js
  // Set the configuration for your app
  // TODO: Replace with your project's config object
  var config = {
    apiKey: "apiKey",
    authDomain: "projectId.firebaseapp.com",
    databaseURL: "https://databaseName.firebaseio.com",
    storageBucket: "bucket.appspot.com"
  };
  firebase.initializeApp(config);

  // Get a reference to the database service
  var database = firebase.database();

  // Store data into users/user01
  firebase.database().ref('users/user01').set({
    username: 'Masashi Katsumata',
    email: 'wf9a5m75@gmail.com'
  });
```

**[this plugin api]**

```js
  // Set the configuration for your app
  // TODO: Replace with your project's config object
  var config = {
    apiKey: "apiKey",
    authDomain: "projectId.firebaseapp.com",
    databaseURL: "https://databaseName.firebaseio.com",
    storageBucket: "bucket.appspot.com"
  };

  // Get a reference to the database service
  var database = plugin.firebase.database({
    'browserConfigs': config
  });

  // Store data into users/user01
  firebase.database().ref('users/user01').set({
    username: 'Masashi Katsumata',
    email: 'wf9a5m75@gmail.com'
  });
```


## Supported platforms
  This plugin supports the following platforms:
  
    - Browser (implemented, not tested deeply)
    - iOS (implemented, not tested deeply)

  `Android` will be supported soon.

## Installation

  - **Step1** Install this plugin

  ```bash
  $> cordova plugin add https://github.com/cordova-firebase-sdk/cordova-firebase-database --save
  ```

  - **Step2** Download `google-services.json`, then put it at `(your_project_dir)/google-services.json`
    Hint: [Get a config file for your Android App](https://support.google.com/firebase/answer/7015592#android)

    Then add the below three lines into `(your_project_dir)/config.xml` file.

    ```xml
    <platform name="android">
        <resource-file src="google-services.json" target="app/google-services.json" />
    </platform>
    ```

  - **Step3** Download `GoogleService-Info.plist`, then put it at `(your_project_dir)/GoogleService-Info.plist`
    Hint: [Get a config file for your iOS App](https://support.google.com/firebase/answer/7015592#ios)

    Then add the below three lines into `(your_project_dir)/config.xml` file.

    ```xml
    <platform name="ios">
        <resource-file src="GoogleService-Info.plist" />
    </platform>
    ```

  - **Step4** Make sure your Firestore rule

    ```
    service cloud.firestore {
      match /databases/{database}/documents {
        match /{document=**} {
          allow read, write : if request.auth != null;  // This is an example.
        }
      }
    }
    ```

  - **Step5** Write HelloWorld code

    ```js
    document.addEventListener('deviceready', function() {
      var database = plugin.firebase.database({
        browserConfigs: {
          apiKey: "(your web API key)",
          databaseURL: "(your database url)"
        }
      });

      database.ref('test').push({
        'user01': {
          'hello':'world'
        }
      }).then(function(ref) {
        return ref.push({
          'user02': {
            'hello':'world'
          }
        });
      });

    });
    ```

  - **Step6** Let's run it!
    ```
    $> cordova platform add browser

    $> cordova run browser
    ```
