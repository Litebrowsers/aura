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

// CRC calculation function using current time as basis
Aura.prototype.calculateTimeCRC = function(data) {
  const currentTime = Date.now();
  let crc = currentTime & 0xFFFFFFFF; // Use current time as initial CRC value

  // Convert data to string if it's not already
  const dataStr = typeof data === 'string' ? data : JSON.stringify(data);

  for (let i = 0; i < dataStr.length; i++) {
    const char = dataStr.charCodeAt(i);
    crc = crc ^ char;

    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xEDB88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }

  // XOR with current time again for additional time-based entropy
  crc = crc ^ (currentTime >>> 16);

  return (crc >>> 0); // Convert to unsigned 32-bit integer
};

// Collect fingerprint
Aura.prototype.collect = function () {
  return new Promise((resolve, reject) => {
    const collectionStartTime = performance.now();

    // Create promises for all functions to run in parallel
    const functionPromises = Aura.fn.functionsNames.map(async (funcName) => {
      if (typeof Aura.fn[funcName] === 'function') {
        const val = await Aura.fn[funcName]();
        return {
          [funcName]: Object.assign({ val })
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

      // Calculate CRC checksum using current time and fingerprint data
      const fingerprintCRC = this.calculateTimeCRC(this.fingerprint);

      // Add CRC and timing information to fingerprint
      this.fingerprint._meta = {
        crc: fingerprintCRC,
        collectionTime: end - collectionStartTime,
        timestamp: Date.now()
      };

      resolve(_aura);
    })
    .catch((error) => {
      console.error('Collection failed:', error);
      resolve(_aura); // Still resolve to maintain backward compatibility
    });
  });
}

export default Aura
