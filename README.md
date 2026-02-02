# Data Auto-Fill Chrome Extension

A Chrome extension that automatically fills web form fields from multi-line address data pasted into the extension.

## Features

- ✍️ **Auto-Fill Forms**: Paste address data and automatically fill form fields
- 🎯 **Smart Field Matching**: Intelligently detects and fills name, street, city, state, ZIP/postal code, and country fields
- 🌍 **Multi-Format Support**: Handles US ZIP codes (12345), Canadian postal codes (K1A 0B1), and UK postal codes (SW1A 1AA)
- � **Flexible Parser**: Handles variable address formats (multiple street lines, missing state, etc.)
- 🎨 **Modern UI**: Beautiful, gradient-based interface with smooth animations
- ⚡ **Fast & Lightweight**: Minimal footprint, instant form filling

## Installation

### Load as Unpacked Extension (Development)

1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top right corner)
4. Click **Load unpacked**
5. Select the directory containing this extension
6. The extension icon should appear in your Chrome toolbar

## Usage

1. Navigate to any web page with a form (checkout, contact form, profile, etc.)
2. Click the **Data Auto-Fill** icon in your Chrome toolbar
3. Paste your address data in the textarea (see format below)
4. Click the **Fill Form** button
5. Watch the form fields auto-populate!

### Address Data Format

Paste your address data in this format:

**US Example:**
```
Michael Smith
11111 First Rodeo Dr
San Francisco, CA 94110
United States
```

**Canadian Example:**
```
John Doe
123 Maple Street
Toronto, ON M5H 2N2
Canada
```

**UK Example:**
```
Jane Wilson
10 Downing Street
London, GB SW1A 2AA
United Kingdom
```

**Format Guidelines**:
- **Line 1**: Full name
- **Middle lines**: Street address (can be multiple lines)
- **Second-to-last line**: City, State ZIP (e.g., "San Francisco, CA 94110")
- **Last line** (optional): Country

The parser is flexible and will do its best even with incomplete data.

## How It Works

### Address Parser

The extension parses your pasted address data into components:
- **Name**: First line
- **Street**: All lines between name and city/state/ZIP
- **City, State, ZIP**: Parsed from the line with format "City, ST 12345"
- **Country**: Last line if it doesn't contain numbers

### Field Matching

The extension automatically detects and fills fields based on their attributes:

- **Name fields**: Any field with "name" in ID or name attribute
- **Street fields**: Fields with "street", "address", "address-1", "line-1"
- **City fields**: Fields with "city", "town", "locality"
- **State fields**: Fields with "state", "province", "region"
- **ZIP fields**: Fields with "zip", "postal-code", "postcode"
- **Country fields**: Fields with "country", "nation"

The extension matches against field IDs, names, classes, placeholders, and labels.

## File Structure

```
chrome_extension_skeleton/
├── manifest.json       # Extension configuration
├── popup.html         # Extension popup interface
├── popup.css          # Popup styling
├── popup.js           # Fill logic and address parser
├── content.js         # Content script (minimal)
├── icon16.png         # 16x16 toolbar icon
├── icon48.png         # 48x48 extension management icon
├── icon128.png        # 128x128 Chrome Web Store icon
├── test.html          # Test page for development
└── README.md          # This file
```

## Permissions

The extension requires the following permissions:

- **activeTab**: Access the current tab's content to fill forms
- **scripting**: Inject scripts into web pages to fill form fields
- **host_permissions**: Access all URLs to work on any website

## Troubleshooting

### Extension doesn't appear in toolbar
- Make sure you've enabled the extension in `chrome://extensions/`
- Try pinning the extension by clicking the puzzle piece icon in the toolbar

### Fields not being filled
- Check that field IDs/names match the patterns (e.g., "name", "street", "city")
- Ensure fields are visible and not disabled/readonly
- Check the browser console for any errors (F12 → Console)
- The extension reports how many fields were filled in the status message

### Address not parsing correctly
- Ensure city/state/ZIP line follows format: "City, ST ZIP"
- State/Province should be 2-letter code (e.g., CA, NY, TX for US; ON, BC for Canada; GB for UK)
- Supported postal code formats:
  - **US**: 5 or 9 digits (e.g., 94110 or 94110-1234)
  - **Canada**: XXX XXX format (e.g., K1A 0B1, M5H 2N2)
  - **UK**: XXX XXX format (e.g., SW1A 1AA, SW1A 2AA)

## Privacy

This extension:
- ✅ Only accesses data when you click "Fill Form"
- ✅ Does not send any data to external servers
- ✅ Does not store or track your browsing history
- ✅ Works completely offline

## Development

To modify the extension:

1. Edit the relevant files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes on the included `test.html` page

## License

This extension is provided as-is for personal use.

## Support

For issues or questions, please refer to the Chrome Extension documentation:
- [Chrome Extension Developer Guide](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
