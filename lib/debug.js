"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Debug = void 0;
const debug_1 = __importDefault(require("debug"));
const path_1 = require("path");
const DEBUG_ROOT = "challenge";
exports.Debug = () => {
    let dirname;
    let filename;
    try {
        throw new Error("nifty trick");
    }
    catch (err) {
        const calleeLine = err.stack.split("\n ")[2];
        const [, callee] = /\((.*):[0-9]*:[0-9]*\)$/.exec(calleeLine);
        const { dir, name } = path_1.parse(callee);
        dirname = dir;
        filename = name;
    }
    const ROOT = path_1.resolve(__dirname, "..");
    const path = [DEBUG_ROOT]
        .concat(dirname
        .replace(ROOT, "")
        .split(path_1.sep)
        .filter(segment => segment !== "")
        .concat(filename))
        .join(":");
    return debug_1.default(path);
};
//# sourceMappingURL=debug.js.map