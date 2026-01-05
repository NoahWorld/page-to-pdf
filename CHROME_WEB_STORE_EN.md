# OneClick Webpage to PDF

A simple Chrome extension to export the current webpage to a PDF file in one click — including long pages and content inside scrollable containers.

## Short description (for Chrome Web Store)

Export the current webpage to PDF in one click. Supports long pages and many scrollable sections.

## Detailed description

**OneClick Webpage to PDF** lets you save the current tab as a PDF file instantly.

It is designed for:

- Saving long articles
- Capturing pages with lazy-loading / “load more” behavior
- Exporting pages that place important content inside scrollable containers

### Key features

- One-click export of the current tab to PDF
- Optional auto-scroll to trigger lazy-loaded content before exporting
- Print background colors/images (optional)
- Paper size and orientation settings
- File naming rules (title / domain + title / custom prefix)

### How to use

1. Open the webpage you want to export.
2. Click the extension icon.
3. Adjust options (paper size, margins, background, auto-scroll) if needed.
4. Click **Export current page to PDF**.
5. The PDF will be downloaded automatically.

### Notes & limitations

- Some websites restrict printing or require you to sign in.
- Chrome system pages (e.g. `chrome://...`) cannot be exported.
- Pages with highly dynamic or virtualized content may not fully render outside their visible area.

## Permission justification

This extension requests the minimum permissions needed to export the current page to PDF and download the result.

- **`activeTab`**
  - Used to access the currently active tab *only after you click the extension*.
  - The extension does not run on pages in the background.

- **`debugger`**
  - Required to temporarily attach to the active tab and use Chrome DevTools Protocol (CDP) printing APIs (e.g. `Page.printToPDF`) to generate the PDF.
  - The debugger connection is created only during export and is detached immediately after the export finishes.

- **`downloads`**
  - Used to save the generated PDF file to your device.

- **`storage`**
  - Used to store your preferences (paper size, margins, background, naming rule, auto-scroll option).

## Privacy policy

### Summary

**OneClick Webpage to PDF** does not collect, store, or transmit personal data.

### Data collection

- **We do not collect any personal information.**
- **We do not sell any data.**
- **We do not transfer any data to external servers.**

### Data processing

- All processing happens locally in your browser.
- The extension generates a PDF from the currently active tab and saves it via Chrome’s download API.
- Your settings (e.g. paper size and margins) are stored locally using Chrome storage.

### Third-party services

- This extension does not use analytics, tracking, or third-party SDKs.

### Contact

If you have questions or requests regarding privacy, you can contact:

- Email: resetshi@gmail.com

### Last updated

2025-12-29
