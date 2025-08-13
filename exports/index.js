/*
# Aura

Copyright © 2025 Litebrowsers
Licensed under a Proprietary License

This software is the confidential and proprietary information of Litebrowsers
Unauthorized copying, redistribution, or use is prohibited.
For licensing inquiries, contact:
vera cohopie at gmail dot com
thor betson at gmail dot com
*/

import Aura from "../core.js";

// Map over Aura in case of overwrite
var _Aura = window.Aura;

// Add noConflict method
Aura.noConflict = function (deep) {
    if (deep && window.Aura === Aura) {
        window.Aura = _Aura;
    }
    return Aura;
};

// Expose Aura identifiers globally, even in AMD
if (typeof noGlobal === "undefined") {
    window.Aura = Aura;
}

// Register as a named AMD module for compatibility
// This handles cases where Aura can be concatenated with other files
// that may use define, but not via a proper concatenation script
if (typeof define === "function" && define.amd) {
    define("aura", [], function () {
        return Aura;
    });
}