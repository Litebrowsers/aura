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

const rollup = require('rollup');
const gulp = require('gulp');
const fs = require('fs');
const path = require('path');
const { nodeResolve } = require('@rollup/plugin-node-resolve');

// Path constants for better maintainability
const PATHS = {
  root: './',
  dist: './dist/apps/aura',
  distApps: './dist/apps',
  functions: './functions',
  inputFile: './index.js',
  packageJson: './package.json'
};

// Import configuration
const auraInputs = require('./inputs/aura');

// Get available function names from functions directory
function getAvailableFunctions() {
  const functionsDir = './functions';
  try {
    return fs.readdirSync(functionsDir)
      .filter(file => file.endsWith('.js') && file !== 'index.js')
      .map(file => file.replace('.js', ''));
  } catch (error) {
    console.error('Error reading functions directory:', error);
    return [];
  }
}

// Parse command line arguments for custom function selection
function parseCustomFunctions() {
  const args = process.argv.slice(2);
  const functionsArg = args.find(arg => arg.startsWith('--functions='));

  if (functionsArg) {
    const customFunctions = functionsArg.split('=')[1].split(',').map(f => f.trim());
    const availableFunctions = getAvailableFunctions();

    // Validate that all specified functions exist
    const invalidFunctions = customFunctions.filter(f => !availableFunctions.includes(f));
    if (invalidFunctions.length > 0) {
      console.error(`Error: The following functions do not exist: ${invalidFunctions.join(', ')}`);
      console.log(`Available functions: ${availableFunctions.join(', ')}`);
      process.exit(1);
    }

    console.log(`Using custom functions: ${customFunctions.join(', ')}`);
    return customFunctions;
  }

  // Check for environment variable
  if (process.env.AURA_FUNCTIONS) {
    const customFunctions = process.env.AURA_FUNCTIONS.split(',').map(f => f.trim());
    const availableFunctions = getAvailableFunctions();

    // Validate that all specified functions exist
    const invalidFunctions = customFunctions.filter(f => !availableFunctions.includes(f));
    if (invalidFunctions.length > 0) {
      console.error(`Error: The following functions do not exist: ${invalidFunctions.join(', ')}`);
      console.log(`Available functions: ${availableFunctions.join(', ')}`);
      process.exit(1);
    }

    console.log(`Using functions from environment variable: ${customFunctions.join(', ')}`);
    return customFunctions;
  }

  // Default to the functions specified in aura.js
  console.log(`Using default functions: ${auraInputs.FUNCTION_NAMES.join(', ')}`);
  return auraInputs.FUNCTION_NAMES;
}

// Get the functions to use for this build
const buildFunctions = parseCustomFunctions();

/**
 * Clean the distribution directory
 */
function clean(cb) {
  try {
    fs.rmSync(PATHS.dist, { recursive: true, force: true });
  } catch (error) {
    // Directory might not exist, which is fine
    if (error.code !== 'ENOENT') {
      console.error('Error cleaning directory:', error);
    }
  }
  cb();
}

/**
 * Generate necessary files for the build
 */
function generateFiles(cb) {
  try {
    // Generate the FUNCTION_NAMES export using buildFunctions
    const input_str = 'export const FUNCTION_NAMES = ' + JSON.stringify(buildFunctions);

    // Generate imports for all functions
    const input_functions_index = buildFunctions.map(func => `import ${func} from "./${func}";\n`).join('');

    // Generate function assignments to Aura prototype
    const input_index = input_functions_index + 
      buildFunctions.map(func => `Aura.prototype.${func} = ${func};\n`).join('');

    // Ensure functions directory exists
    try {
      fs.accessSync(PATHS.functions);
    } catch (err) {
      // Directory doesn't exist, create it
      fs.mkdirSync(PATHS.functions, { recursive: true });
    }

    // Write generated_inputs.js
    fs.writeFileSync(path.join(PATHS.root, 'generated_inputs.js'), input_str);

    // Write index.js
    fs.writeFileSync(path.join(PATHS.functions, 'index.js'), input_index);

    cb();
  } catch (error) {
    console.error('Error generating files:', error);
    cb(error);
  }
}

/**
 * Remove license comments from code
 */
function removeLicenses(code) {
  // Step 1: Find and temporarily replace AUTO GENERATED CODE comments with placeholders
  const autoGenComments = [];
  let tempCode = code.replace(/\/\*\s*AUTO GENERATED CODE\s*\*\//g, (match) => {
    const placeholder = `__AUTO_GEN_PLACEHOLDER_${autoGenComments.length}__`;
    autoGenComments.push(match);
    return placeholder;
  });

  // Step 2: Remove multi-line license comments that contain license-related keywords
  const licensePattern = /\/\*[\s\S]*?(?:Copyright|Licensed|License|Proprietary|confidential|unauthorized|prohibited)[\s\S]*?\*\//gi;
  tempCode = tempCode.replace(licensePattern, '');

  // Step 3: Remove single-line license comments
  const singleLineLicensePattern = /\/\/.*(?:Copyright|Licensed|License|Proprietary|confidential|unauthorized|prohibited).*$/gmi;
  tempCode = tempCode.replace(singleLineLicensePattern, '');

  // Step 4: Remove any remaining empty comment blocks
  tempCode = tempCode.replace(/\/\*\s*\*\//g, '');

  // Step 5: Restore AUTO GENERATED CODE comments
  autoGenComments.forEach((comment, index) => {
    const placeholder = `__AUTO_GEN_PLACEHOLDER_${index}__`;
    tempCode = tempCode.replace(placeholder, comment);
  });

  // Step 6: Clean up multiple consecutive newlines
  tempCode = tempCode.replace(/\n\s*\n\s*\n/g, '\n\n');

  return tempCode;
}

/**
 * Bundle the JavaScript code using Rollup
 */
async function bundle() {
  try {
    // Create bundle
    const bundle = await rollup.rollup({
      input: PATHS.inputFile,
      plugins: [
        nodeResolve()
      ]
    });

    // Generate output
    const { output: [{ code }] } = await bundle.generate({
      file: `${PATHS.dist}/aura.js`,
      format: 'umd',
      name: 'aura',
      sourcemap: false
    });

    // Replace version placeholder
    const version = require(PATHS.packageJson).version;
    const finalCode = code.replace('@VERSION', version);

    return finalCode;
  } catch (error) {
    console.error('Error bundling code:', error);
    throw error;
  }
}

/**
 * Copy static assets to the distribution directory
 * @param {boolean} isDev - Whether this is a development build
 * @param {function} cb - Callback function
 */
function copyAssets(isDev, cb) {
  try {
    // Ensure dist directory exists
    try {
      fs.accessSync(PATHS.distApps);
    } catch (err) {
      // Directory doesn't exist, create it
      fs.mkdirSync(PATHS.distApps, { recursive: true });
    }

    // Copy all HTML files from examples directory
    const examplesDir = './examples';
    const htmlFiles = fs.readdirSync(examplesDir).filter(file => file.endsWith('.html'));

    htmlFiles.forEach(htmlFile => {
      const sourcePath = path.join(examplesDir, htmlFile);
      const destPath = path.join(PATHS.distApps, htmlFile);

      // Read the HTML file content
      let htmlContent = fs.readFileSync(sourcePath, 'utf8');

      // Replace script src based on build type
      const scriptSrc = isDev ? 'aura/aura.js' : 'aura/aura.min.js';

      // Replace regular aura script references
      htmlContent = htmlContent.replace(/src="aura\/aura\.min\.js"/g, `src="${scriptSrc}"`);

      // Write the modified HTML file
      fs.writeFileSync(destPath, htmlContent);
      console.log(`Copied ${htmlFile} to distribution directory with ${isDev ? 'development' : 'production'} script reference`);
    });

    if (cb) cb();
  } catch (error) {
    console.error('Error copying assets:', error);
    if (cb) cb(error);
  }
}

/**
 * Add fetchData functionality with data attributes support
 */
function addFetchDataFunctionality(code) {
  const fetchDataCode = `
// Aura Data Attribute Configuration Support
(function() {
  // Default configuration
  const defaultConfig = {
    apiEndpoint: "",
    userID: null,
    token: null,
    buttonsEvents: true
  };

  let config = { ...defaultConfig };

  // Check for data attributes on the script tag
  const scriptTags = document.querySelectorAll('script[src*="aura"]');
  const auraScript = Array.from(scriptTags).find(script => 
    script.src.includes('aura.min.js') || script.src.includes('aura.js')
  );

  if (auraScript) {
    const apiEndpoint = auraScript.getAttribute('data-api-endpoint');
    const userID = auraScript.getAttribute('user-id');
    const token = auraScript.getAttribute('data-token');
    const buttonsEvents = auraScript.getAttribute('buttons-events');

    if (apiEndpoint) config.apiEndpoint = apiEndpoint;
    if (token) config.token = token;
    if (userID) config.userID = userID;
    if (buttonsEvents !== null) config.buttonsEvents = buttonsEvents === 'true';
  }

  if (config.apiEndpoint === "") {
    return;
  }

  // Set the global config (fallback to existing AuraConfig if already set)
  window.AuraConfig = window.AuraConfig || config;

  // URL obfuscation and request disguising utilities
  function generateObfuscatedPath() {
    const paths = [
      'api/v1/data', 'assets/config', 'static/info', 'content/meta',
      'resources/data', 'public/stats', 'media/info', 'files/config',
      'cdn/assets', 'cache/data', 'temp/info', 'logs/meta',
      'js/modules', 'css/themes', 'img/gallery', 'fonts/webfonts',
      'uploads/files', 'downloads/docs', 'backup/data', 'config/settings'
    ];
    const extensions = ['.json', '.txt', '.xml', '.js', '.css', '.php', '.html'];
    const randomPath = paths[Math.floor(Math.random() * paths.length)];
    const randomExt = extensions[Math.floor(Math.random() * extensions.length)];
    return randomPath + randomExt;
  }

  function addRequestDelay() {
    // Add random delay between 100ms and 2000ms to mimic human behavior
    const delay = Math.floor(Math.random() * 1900) + 100;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  function generateFakeQueryParams() {
    const params = new URLSearchParams();
    const fakeParams = [
      { key: 'v', value: Math.floor(Math.random() * 100) },
      { key: 'ref', value: btoa(document.referrer || 'direct').substring(0, 8) },
      { key: 'ts', value: Date.now() },
      { key: 'r', value: Math.random().toString(36).substring(2, 8) }
    ];

    // Add 1-3 random fake parameters
    const numParams = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numParams; i++) {
      const param = fakeParams[Math.floor(Math.random() * fakeParams.length)];
      params.append(param.key, param.value);
    }

    return params.toString();
  }

  function obfuscatePayload(data, userID, token) {
    // Create a disguised payload that looks like legitimate web traffic
    const timestamp = Date.now();
    const sessionId = Math.random().toString(36).substring(2, 15);

    // Encode the actual data
    const encodedData = btoa(JSON.stringify(data));

    // Create a disguised request that looks like a legitimate web request
    return {
      session: sessionId,
      timestamp: timestamp,
      uid: btoa(userID),
      auth: btoa(token),
      payload: encodedData,
      version: '1.0',
      client: 'web',
      // Add some noise to make it look more legitimate
      browser: navigator.userAgent.split(' ')[0],
      lang: navigator.language,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  function createLegitimateHeaders() {
    return {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': navigator.language + ',en;q=0.9',
      'Cache-Control': 'no-cache',
      'X-Requested-With': 'XMLHttpRequest'
    };
  }

  async function auraFetchData(eventType = 'Visit', elementId = null, name = null) {
    try {
      // Add random delay to mimic human behavior
      await addRequestDelay();

      const aura = new Aura({});
      const result = await aura.collect();

      // Prepare the actual data payload
      const actualData = { 
        query: result.fingerprint,
        category: eventType,
      };

      if (elementId) {
        actualData.elementId = elementId;
      }

      if (name) {
        actualData.name = name;
      }

      // Create obfuscated payload and URL
      const obfuscatedPayload = obfuscatePayload(actualData, window.AuraConfig.userID, window.AuraConfig.token);
      const obfuscatedPath = generateObfuscatedPath();
      const fakeParams = generateFakeQueryParams();
      const headers = createLegitimateHeaders();

      // Convert to form data to disguise as regular form submission
      const formData = new URLSearchParams();
      Object.keys(obfuscatedPayload).forEach(key => {
        formData.append(key, obfuscatedPayload[key]);
      });

      // Build the obfuscated endpoint with fake query parameters
      const baseEndpoint = window.AuraConfig.apiEndpoint.endsWith('/') 
        ? window.AuraConfig.apiEndpoint + obfuscatedPath
        : window.AuraConfig.apiEndpoint + '/' + obfuscatedPath;

      const endpoint = baseEndpoint + '?' + fakeParams;

      // Attempt request with fallback mechanism
      let response;
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          response = await fetch(endpoint, {
            method: "POST",
            headers: headers,
            body: formData.toString()
          });

          if (response.ok) {
            break;
          } else if (attempts === maxAttempts - 1) {
            throw new Error("HTTP " + response.status + ": " + response.statusText);
          }
        } catch (fetchError) {
          attempts++;
          if (attempts === maxAttempts) {
            throw fetchError;
          }
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
        }
      }

      const data = await response.json();

      // Trigger custom event with the data
      window.dispatchEvent(new CustomEvent('auraDataReceived', { 
        detail: { 
          fingerprint: result.fingerprint, 
          apiResponse: data,
          category: eventType,
          elementId: elementId,
          name: name,
          endpoint: endpoint
        } 
      }));

      return data;
    } catch (error) {
      console.warn("Aura fetch error:", error);
      window.dispatchEvent(new CustomEvent('auraDataError', { 
        detail: { 
          error: error.message,
          category: eventType,
          elementId: elementId,
          name: name
        } 
      }));
    }
  }

  // Auto-execute if enabled (page visit event)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => auraFetchData('Visit'));
  } else {
    auraFetchData('Visit');
  }

  // Add button click event listeners
  if (config.buttonsEvents) {
    function setupButtonListeners() {
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        button.addEventListener('click', function(event) {
          const buttonId = this.id || this.getAttribute('data-id') || 'button-' + Array.from(buttons).indexOf(this);
          const buttonName = this.textContent.trim() || this.getAttribute('aria-label') || this.getAttribute('title') || 'Unnamed Button';
          auraFetchData('Click', buttonId, buttonName);
        });
      });
    }

    // Setup button listeners when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupButtonListeners);
    } else {
      setupButtonListeners();
    }

    // Also setup listeners for dynamically added buttons
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) { // Element node
            if (node.tagName === 'BUTTON') {
              const buttonId = node.id || node.getAttribute('data-id') || 'button-' + Date.now();
              const buttonName = node.textContent.trim() || node.getAttribute('aria-label') || node.getAttribute('title') || 'Unnamed Button';
              node.addEventListener('click', function(event) {
                auraFetchData('Click', buttonId, buttonName);
              });
            }
            // Also check for buttons within added elements
            const buttons = node.querySelectorAll && node.querySelectorAll('button');
            if (buttons) {
              buttons.forEach(button => {
                const buttonId = button.id || button.getAttribute('data-id') || 'button-' + Date.now();
                const buttonName = button.textContent.trim() || button.getAttribute('aria-label') || button.getAttribute('title') || 'Unnamed Button';
                button.addEventListener('click', function(event) {
                  auraFetchData('Click', buttonId, buttonName);
                });
              });
            }
          }
        });
      });
    });
  }

  // Expose the function globally for manual calls
  window.auraFetchData = auraFetchData;
})();`;

  return code + fetchDataCode;
}


/**
 * Process the bundled code (minify and obfuscate)
 */
function processBundle(code) {
  try {
    // Remove licenses from code before processing
    const cleanCode = removeLicenses(code);

    // Add fetchData functionality with data attributes support
    const codeWithFetchData = addFetchDataFunctionality(cleanCode);

    // Ensure dist directory exists
    try {
      fs.accessSync(PATHS.dist);
    } catch (err) {
      // Directory doesn't exist, create it
      fs.mkdirSync(PATHS.dist, { recursive: true });
    }

    // Use UglifyJS directly
    const UglifyJS = require('uglify-js');
    const minified = UglifyJS.minify(codeWithFetchData, {
      mangle: true,
      compress: {
        drop_console: true,
        drop_debugger: true,
        global_defs: {
          DEBUG: false
        }
      },
      output: {
        ascii_only: true
      },
      ie8: true
    });

    if (minified.error) {
      throw new Error(`Error during uglification: ${minified.error}`);
    }

    // Use JavaScript Obfuscator directly
    // const JavaScriptObfuscator = require('javascript-obfuscator');
    // const obfuscated = JavaScriptObfuscator.obfuscate(minified.code, {
    //   unicodeEscapeSequence: true,
    //   stringArray: true,
    //   compact: true
    // }).getObfuscatedCode();

    // Write the final file
    const outputPath = path.join(PATHS.dist, 'aura.min.js');
    fs.writeFileSync(outputPath, minified.code);

    return Promise.resolve();
  } catch (error) {
    console.error('Error processing bundle:', error);
    return Promise.reject(error);
  }
}

/**
 * Development build task - doesn't minify or obfuscate
 */
gulp.task('dev-build', gulp.series(
  clean,
  generateFiles,
  async function devBuild() {
    const code = await bundle();
    copyAssets(true); // Pass isDev=true for development build

    // Ensure dist directory exists
    try {
      fs.accessSync(PATHS.dist);
    } catch (err) {
      // Directory doesn't exist, create it
      fs.mkdirSync(PATHS.dist, { recursive: true });
    }

    // Remove licenses and add fetchData functionality with data attributes support
    const cleanCode = removeLicenses(code);
    const codeWithFetchData = addFetchDataFunctionality(cleanCode);
    fs.writeFileSync(path.join(PATHS.dist, 'aura.js'), codeWithFetchData);

    return Promise.resolve();
  }
));

/**
 * Watch task for development
 */
gulp.task('watch', gulp.series('dev-build', function() {
  gulp.watch([
    `${PATHS.functions}/**/*.js`,
    './inputs/**/*.js',
    './examples/**/*.html'
  ], gulp.series('dev-build'));
}));

/**
 * Production build task - creates both external configurable versions
 */
gulp.task('build', gulp.series(
  clean,
  generateFiles,
  async function prodBuild() {
    const code = await bundle();
    copyAssets(false); // Pass isDev=false for production build

    // Ensure dist directory exists
    try {
      fs.accessSync(PATHS.dist);
    } catch (err) {
      // Directory doesn't exist, create it
      fs.mkdirSync(PATHS.dist, { recursive: true });
    }

    // Create development version (aura.js)
    const cleanCode = removeLicenses(code);
    const codeWithFetchData = addFetchDataFunctionality(cleanCode);
    fs.writeFileSync(path.join(PATHS.dist, 'aura.js'), codeWithFetchData);

    // Create minified production version (aura.min.js)
    await processBundle(code);

    return Promise.resolve();
  }
));

// Help task to show available functions and usage
gulp.task('help', function(cb) {
  const availableFunctions = getAvailableFunctions();
  console.log('\n=== Aura Build System Help ===\n');
  console.log('Available test functions:');
  availableFunctions.forEach(func => console.log(`  - ${func}`));
  console.log('\nUsage examples:');
  console.log('  Default build (uses functions from inputs/aura.js):');
  console.log('    gulp build');
  console.log('    gulp dev-build');
  console.log('\n  Custom functions via command line:');
  console.log('    gulp build --functions=Timezone,Canvas,Screen');
  console.log('    gulp dev-build --functions=Connection,WebglMetadata');
  console.log('\n  Custom functions via environment variable:');
  console.log('    AURA_FUNCTIONS=Timezone,Canvas,Screen gulp build');
  console.log('    AURA_FUNCTIONS=Connection,WebglMetadata gulp dev-build');
  console.log('\n  List all available functions:');
  console.log('    gulp list-functions');
  console.log('');
  cb();
});

// Task to list available functions
gulp.task('list-functions', function(cb) {
  const availableFunctions = getAvailableFunctions();
  console.log('\nAvailable test functions:');
  availableFunctions.forEach(func => console.log(`  - ${func}`));
  console.log('');
  cb();
});

// Alias for backward compatibility
gulp.task('aura-build', gulp.series('build'));

// Default task
exports.default = gulp.series('build');
