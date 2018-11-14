"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
// Exports modules for type script compiler
__export(require("./CordovaFirebaseDatabase"));
__export(require("./Database"));
__export(require("./DataClasses"));
__export(require("./OnDisconnect"));
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
