// Exports modules for type script compiler
export * from "./CordovaFirebaseDatabase";
export * from "./Database";
export * from "./DataClasses";
export * from "./INativeEventParams";
export * from "./OnDisconnect";

// Registers modules as part of cordova plugin
// declare let window: any;
// if (window.cordova.version) {
//   const keys: Array<string> = Object.keys(exports);
//   keys.forEach((key: string) => {
//     const anotherModule = {
//       exports: {
//         __esModule: true,
//       },
//     };
//     anotherModule.exports[key] = exports[key];
//     window.cordova.define.moduleMap["cordova-firebase-database/" + key] = anotherModule;
//   });
//
//   const indexModue: any = { exports };
//   window.cordova.define.moduleMap["cordova-firebase-database/index"] = indexModue;
// }
