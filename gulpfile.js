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
    // Generate the FUNCTION_NAMES export
    const input_str = 'export const FUNCTION_NAMES = ' + JSON.stringify(auraInputs.FUNCTION_NAMES);

    // Generate imports for all functions
    const input_functions_index = auraInputs.FUNCTION_NAMES.map(func => `import ${func} from "./${func}";\n`).join('');

    // Generate function assignments to Aura prototype
    const input_index = input_functions_index + 
      auraInputs.FUNCTION_NAMES.map(func => `Aura.prototype.${func} = ${func};\n`).join('');

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
    apiEndpoint: "https://sl-st.com/api/v1/stat/pub/metrics/",
    userID: null,
    token: null,
    autoFetch: true
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
    const autoFetch = auraScript.getAttribute('data-auto-fetch');

    if (apiEndpoint) config.apiEndpoint = apiEndpoint;
    if (token) config.token = token;
    if (userID) config.userID = userID;
    if (autoFetch !== null) config.autoFetch = autoFetch === 'true';
  }

  // Set the global config (fallback to existing AuraConfig if already set)
  window.AuraConfig = window.AuraConfig || config;

  // Auto-fetch function
  async function auraFetchData() {
    try {
      const aura = new Aura({});
      const result = await aura.collect();
      
      const headers = {
        "Content-Type": "application/json"
      };

      const response = await fetch(window.AuraConfig.apiEndpoint + '/' + window.AuraConfig.userID + "/" + window.AuraConfig.token, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ query: result.fingerprint })
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data from API");
      }

      const data = await response.json();

      // Trigger custom event with the data
      window.dispatchEvent(new CustomEvent('auraDataReceived', { 
        detail: { 
          fingerprint: result.fingerprint, 
          apiResponse: data 
        } 
      }));

      return data;
    } catch (error) {
      console.warn("Aura fetch error:", error);
      window.dispatchEvent(new CustomEvent('auraDataError', { 
        detail: { error: error.message } 
      }));
    }
  }

  // Auto-execute if enabled
  if (window.AuraConfig.autoFetch) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', auraFetchData);
    } else {
      auraFetchData();
    }
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
    const JavaScriptObfuscator = require('javascript-obfuscator');
    const obfuscated = JavaScriptObfuscator.obfuscate(minified.code, {
      unicodeEscapeSequence: true,
      stringArray: true,
      compact: true
    }).getObfuscatedCode();

    // Write the final file
    const outputPath = path.join(PATHS.dist, 'aura.min.js');
    fs.writeFileSync(outputPath, obfuscated);

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

    // Create external config version
    await processBundle(code);

    return Promise.resolve();
  }
));

// Alias for backward compatibility
gulp.task('aura-build', gulp.series('build'));

// Default task
exports.default = gulp.series('build');
