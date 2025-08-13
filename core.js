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

// Define a local copy of Aura

var options = { timeout: 2000 }, _aura
var Aura = function (opt) {
  // The Aura object is actually just the init constructor 'enhanced'
  // Need init if Aura is called (just allow error to be thrown if not included)
  options = Object.assign(options, opt || {});
  _aura = this;
  this.fingerprint = {};
  return this
}

Aura.fn = Aura.prototype = {
  functionsNames: [],

  constructor: Aura
}

// Collect fingerprint
Aura.prototype.collect = function () {
  return new Promise((resolve, reject) => {
    // Create promises for all functions to run in parallel
    const functionPromises = Aura.fn.functionsNames.map(async (funcName) => {
      if (typeof Aura.fn[funcName] === 'function') {
        const time_start = performance.now();
        const val = await Aura.fn[funcName]();
        const time_end = performance.now();
        return {
          [funcName]: Object.assign({ val }, { t: time_end - time_start })
        };
      } else {
        console.warn(funcName, ' is not available!');
        return null;
      }
    });

    // Set up timeout
    const timeoutPromise = new Promise((_, timeoutReject) => {
      setTimeout(() => {
        timeoutReject(new Error(`Collection timeout after ${options.timeout}ms`));
      }, options.timeout);
    });

    // Race between all functions completing and timeout
    Promise.race([
      Promise.all(functionPromises),
      timeoutPromise
    ])
    .then((results) => {
      // Merge all results into fingerprint
      results.forEach(result => {
        if (result) {
          this.fingerprint = Object.assign(this.fingerprint, result);
        }
      });
      const end = performance.now();
      resolve(_aura);
    })
    .catch((error) => {
      console.error('Collection failed:', error);
      resolve(_aura); // Still resolve to maintain backward compatibility
    });
  });
}

export default Aura
