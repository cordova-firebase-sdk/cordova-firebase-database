"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execCmd = jest.fn((params) => {
    return Promise.resolve(params);
});
