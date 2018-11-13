"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.platformId = "browser";
exports.setPlatformId = (pId) => {
    exports.platformId = pId;
};
exports.exec = jest.fn((onSuccess, onError, pluginName, methodName, args) => {
    onSuccess();
});
