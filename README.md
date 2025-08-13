# Aura

A powerful client-side browser fingerprinting and metrics collection library designed for accurate user identification 
and analytics.

## Overview

Aura is a proprietary JavaScript library developed by Litebrowsers that collects comprehensive browser fingerprinting 
data to create unique user profiles. The library runs multiple fingerprinting techniques in parallel and provides 
detailed timing information for each collection method.

## Features

- **Multi-dimensional Fingerprinting**: Collects data from various browser APIs and properties
- **Parallel Processing**: Runs all fingerprinting functions simultaneously for optimal performance
- **Timing Analytics**: Measures execution time for each fingerprinting method
- **Configurable Timeout**: Prevents hanging on slow or unresponsive fingerprinting methods
- **Auto-submission**: Can automatically send collected data to your API endpoint
- **Data Attribute Configuration**: Easy setup using HTML data attributes

## Fingerprinting Methods

Aura collects the following types of browser data:

- **Canvas Fingerprinting**: Unique rendering characteristics
- **Screen Information**: Display properties and capabilities
- **Connection Details**: Network connection information
- **Locale Settings**: Language and regional preferences
- **Timezone Data**: User's timezone information
- **User Agent**: Browser and system information
- **Page Properties**: Current page characteristics

## Installation

### Via Script Tag

```html
<script 
  src="path/to/aura.min.js"
</script>
```

### Manual Integration

```html
<script src="path/to/aura.min.js"></script>
<script>
  const aura = new Aura({ timeout: 3000 });
  
  aura.collect().then((result) => {
    console.log('Fingerprint collected:', result.fingerprint);
    // Send data to your server
  });
</script>
```

## Configuration Options

### Data Attributes

Configure Aura using data attributes on the script tag:

- `data-api-endpoint`: Your API endpoint URL for data submission
- `data-token`: Authentication token for API requests
- `data-auto-fetch`: Set to "true" to automatically collect and send data
- `user-id`: Optional user identifier

### Constructor Options

```javascript
const aura = new Aura({
  timeout: 2000  // Timeout in milliseconds (default: 2000)
});
```

## Usage Examples

### Basic Usage

```javascript
// Initialize Aura
const aura = new Aura();

// Collect fingerprint data
aura.collect().then((auraInstance) => {
  console.log('Collected fingerprint:', auraInstance.fingerprint);
  
  // Access individual metrics with timing
  Object.keys(auraInstance.fingerprint).forEach(key => {
    const metric = auraInstance.fingerprint[key];
    console.log(`${key}:`, metric.val);
  });
});
```

### With Custom Timeout

```javascript
const aura = new Aura({ timeout: 5000 });

aura.collect().then((result) => {
  // Process results
}).catch((error) => {
  console.error('Collection failed:', error);
});
```

### Auto-submission Setup

```html
<script 
  src="aura/aura.min.js"
  data-api-endpoint="https://analytics.example.com/collect"
  data-token="your-secret-token"
  user-id="user-123"
  buttons-events="false"
 >
</script>
```

## API Reference

### Constructor

#### `new Aura(options)`

Creates a new Aura instance.

**Parameters:**
- `options` (Object, optional)
  - `timeout` (Number): Maximum time to wait for all fingerprinting methods to complete (default: 2000ms)

### Methods

#### `collect()`

Collects browser fingerprinting data from all available methods.

**Returns:** Promise that resolves to the Aura instance with populated `fingerprint` property.

**Example:**
```javascript
aura.collect().then((auraInstance) => {
  // auraInstance.fingerprint contains all collected data
});
```

### Properties

#### `fingerprint`

Object containing all collected fingerprinting data. Each property contains:
- `val`: The collected value

## Building from Source

### Prerequisites

- Node.js and npm
- Gulp CLI

### Build Commands

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Build for development
npm run dev-build
```

The build process includes:
- Code bundling with Rollup
- JavaScript obfuscation
- Minification with UglifyJS

## Browser Compatibility

Aura is designed to work across modern browsers and gracefully handles unsupported features. The library uses:

- ES6+ features with fallbacks
- Modern browser APIs with feature detection
- Performance API for timing measurements

## Privacy and Legal Considerations

⚠️ **Important**: Browser fingerprinting may be subject to privacy regulations in various jurisdictions. Ensure
compliance with:

- GDPR (European Union)
- CCPA (California)
- Other applicable privacy laws

Always inform users about data collection and obtain necessary consents.

## License

Copyright © 2025 LiteBrowsers  
Licensed under a Proprietary License

This software is confidential and proprietary information of Litebrowsers. Unauthorized copying, redistribution, or 
use is prohibited.

## Support

For licensing inquiries and support, contact:
- vera cohopie at gmail dot com
- thor betson at gmail dot com

## Version

Current version: 1.0.0

---

*Aura - Precision fingerprinting for the modern web*