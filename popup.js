// Popup script for auto-filling forms
document.addEventListener('DOMContentLoaded', function () {
  const fillBtn = document.getElementById('fillBtn');
  const fillStatus = document.getElementById('fillStatus');
  const addressInput = document.getElementById('addressInput');

  // Fill form with address data
  fillBtn.addEventListener('click', async function () {
    const addressText = addressInput.value.trim();

    if (!addressText) {
      showStatus('⚠ Please paste address data first', 'error');
      return;
    }

    try {
      showStatus('Parsing address...', 'info');
      fillBtn.disabled = true;

      // Parse the address
      const parsedData = parseAddress(addressText);

      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // Inject content script
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });

      // Fill the form
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: fillFormFields,
        args: [parsedData]
      });

      if (result.result && result.result.success) {
        showStatus(`✓ Filled ${result.result.filledCount} field(s)!`, 'success');
      } else {
        showStatus('⚠ No matching fields found on page', 'error');
      }

      fillBtn.disabled = false;
    } catch (error) {
      console.error('Error filling form:', error);
      showStatus('✗ Error: ' + error.message, 'error');
      fillBtn.disabled = false;
    }
  });

  function showStatus(message, type) {
    fillStatus.textContent = message;
    fillStatus.className = 'status ' + type;
  }

  // Parse address string into components
  function parseAddress(addressText) {
    const lines = addressText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    const parsed = {
      name: '',
      street: '',
      city: '',
      state: '',
      zip: '',
      country: ''
    };

    if (lines.length === 0) return parsed;

    // First line is usually the name
    parsed.name = lines[0];

    // Last line might be country (if it's a known country or doesn't have numbers)
    const lastLine = lines[lines.length - 1];
    const commonCountries = ['united states', 'usa', 'canada', 'uk', 'united kingdom', 'australia', 'germany', 'france'];
    if (lines.length > 2 && (commonCountries.includes(lastLine.toLowerCase()) || !/\d/.test(lastLine))) {
      parsed.country = lastLine;
      lines.pop(); // Remove country from lines
    }

    // Second to second-last lines are address components
    if (lines.length >= 2) {
      // Street address is everything between name and city/state/zip line
      const cityStateZipLine = lines[lines.length - 1];

      // Parse city, state, zip from last line (format: "City, ST ZIP" or "City ST ZIP")
      // Support US (12345 or 12345-6789), Canadian (K1A 0B1), and UK (SW1A 1AA) postal codes
      const cityStateZipMatch = cityStateZipLine.match(/^(.+?),?\s+([A-Z]{2})\s+([A-Z0-9]{3}\s[A-Z0-9]{3}|\d{5}(?:-\d{4})?)$/);
      if (cityStateZipMatch) {
        parsed.city = cityStateZipMatch[1].replace(/,$/, '').trim();
        parsed.state = cityStateZipMatch[2];
        parsed.zip = cityStateZipMatch[3];

        // Everything between name and city/state/zip is street address
        if (lines.length > 2) {
          parsed.street = lines.slice(1, -1).join(', ');
        }
      } else {
        // If we can't parse city/state/zip, try to extract zip code
        // Support US (12345 or 12345-6789), Canadian (K1A 0B1), and UK (SW1A 1AA) postal codes
        const zipMatch = cityStateZipLine.match(/([A-Z0-9]{3}\s[A-Z0-9]{3}|\d{5}(?:-\d{4})?)/);
        if (zipMatch) {
          parsed.zip = zipMatch[1];
          // Try to extract state (2 letter code before zip)
          const stateMatch = cityStateZipLine.match(/\b([A-Z]{2})\s+(?:[A-Z0-9]{3}\s[A-Z0-9]{3}|\d{5})/);
          if (stateMatch) {
            parsed.state = stateMatch[1];
            // City is everything before state
            const cityPart = cityStateZipLine.substring(0, cityStateZipLine.indexOf(parsed.state)).replace(/,$/, '').trim();
            parsed.city = cityPart;
          } else {
            // Just get city (everything before zip)
            parsed.city = cityStateZipLine.substring(0, cityStateZipLine.indexOf(parsed.zip)).replace(/,$/, '').trim();
          }
        } else {
          // No zip found, treat last line as city
          parsed.city = cityStateZipLine;
        }

        // Street is middle lines
        if (lines.length > 2) {
          parsed.street = lines.slice(1, -1).join(', ');
        }
      }
    } else if (lines.length === 1) {
      // Only name provided
      parsed.name = lines[0];
    }

    return parsed;
  }
});


// This function will be injected into the page to fill form fields
function fillFormFields(parsedData) {
  let filledCount = 0;

  // Helper function to set value
  function setValue(element, value) {
    if (!element || !value) return false;

    // For input/textarea, set value property
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      element.value = value;
      // Trigger change event
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }

    return false;
  }

  // Helper function to check if element is visible and editable
  function isEditable(element) {
    if (!element) return false;
    const style = window.getComputedStyle(element);
    return style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      !element.disabled &&
      !element.readOnly;
  }

  // Find and fill fields
  const allInputs = document.querySelectorAll('input, textarea, select');

  allInputs.forEach(element => {
    if (!isEditable(element)) return;

    const id = (element.id || '').toLowerCase();
    const name = (element.name || '').toLowerCase();
    const className = (element.className || '').toLowerCase();
    const placeholder = (element.placeholder || '').toLowerCase();
    const ariaLabel = (element.getAttribute('aria-label') || '').toLowerCase();
    const title = (element.title || element.getAttribute('title') || '').toLowerCase();

    // Keep original values for pattern matching
    const placeholderOrig = element.placeholder || '';
    const titleOrig = element.title || element.getAttribute('title') || '';

    // Check for associated label
    let labelText = '';
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) labelText = label.textContent.toLowerCase();
    }

    const searchText = `${id} ${name} ${className} ${placeholder} ${ariaLabel} ${labelText} ${title}`;


    // Fill name field - just match by ID/name attribute
    if (parsedData.name && /name/i.test(id + ' ' + name)) {
      if (setValue(element, parsedData.name)) filledCount++;
    }


    // Fill street address
    if (parsedData.street && /\b(street|address|address[-_\s]?1|line[-_\s]?1)\b/i.test(searchText)) {
      // Skip city, state, zip, country specific fields
      if (!/\b(city|state|zip|postal|country)\b/i.test(searchText)) {
        if (setValue(element, parsedData.street)) filledCount++;
      }
    }

    // Fill city
    if (parsedData.city && /\b(city|town|locality)\b/i.test(searchText)) {
      if (setValue(element, parsedData.city)) filledCount++;
    }

    // Fill state
    if (parsedData.state && /\b(state|province|region)\b/i.test(searchText)) {
      if (setValue(element, parsedData.state)) filledCount++;
    }

    // Fill zip/postal code
    if (parsedData.zip && /\b(zip|postal[-_\s]?code|postcode|post[-_\s]?code)\b/i.test(searchText)) {
      if (setValue(element, parsedData.zip)) filledCount++;
    }

    // Fill country
    if (parsedData.country && /\b(country|nation)\b/i.test(searchText)) {
      if (setValue(element, parsedData.country)) filledCount++;
    }
  });

  return { success: filledCount > 0, filledCount };
}
