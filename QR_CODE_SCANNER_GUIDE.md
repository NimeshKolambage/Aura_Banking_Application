# QR Code Transaction Scanner - Usage Guide

## Overview
The Aura Banking Application now supports QR code scanning for **Transfer Money** and **Deposit Money** transactions. This allows users to quickly initiate transactions by scanning QR codes.

## Features

### 1. Transfer Money with QR Code
**Location:** Transfer page (`transfer.html`)

**How it works:**
- Click on "Scan Recipient QR Code" button on the Transfer form
- A modal opens with camera access
- Click "Start Camera" to activate the camera
- Point your device camera at a recipient's transfer QR code
- The QR code is scanned and recipient details are automatically filled in the form
- Recipient account and name are pre-populated
- Amount can also be pre-filled if included in the QR code

**QR Code Format for Transfer:**
```
transfer:recipientAccount:recipientName:amount:reference
```

**Example QR codes:**
```
transfer:1234567890:John Doe:500:REF001
transfer:9876543210:Sarah Smith:250:
```

---

### 2. Deposit Money with QR Code
**Location:** Deposit page (`deposit.html`)

**How it works:**
- Select a deposit method (Check, Transfer, Wire, or Cash)
- Click on "Scan Sender QR Code" button in the form
- A modal opens with camera access
- Click "Start Camera" to activate the camera
- Point your device camera at a sender's deposit QR code
- The QR code is scanned and sender/bank details are automatically filled
- Bank code, amount, and reference number are pre-populated
- Amount field is automatically filled

**QR Code Format for Deposit:**
```
deposit:recipientAccount:bankCode:amount:reference
```

**Example QR codes:**
```
deposit:9876543210:BANK123:1000:DEP001
deposit:5555666677:CITYBANK:500:
```

---

## How to Generate QR Codes

### From Dashboard
1. Go to Dashboard page
2. Click "Scan QR" button in Quick Actions
3. Switch to "Generate QR Code" tab
4. Select the page (Transfer, Deposit, etc.)
5. QR code is generated automatically
6. Click "Download QR Code" or "Print QR Code"

### Programmatically
Use the `QRCode` library (included):

**For Transfer QR Code:**
```javascript
const qr = new QRCode(document.getElementById("qrContainer"), {
    text: "transfer:1234567890:John Doe:500:REF001",
    width: 256,
    height: 256,
    colorDark: "#1976d2",
    colorLight: "#ffffff"
});
```

**For Deposit QR Code:**
```javascript
const qr = new QRCode(document.getElementById("qrContainer"), {
    text: "deposit:9876543210:BANK123:1000:DEP001",
    width: 256,
    height: 256,
    colorDark: "#4caf50",
    colorLight: "#ffffff"
});
```

---

## Technical Details

### QR Scanner Utility (`qr-transaction-scanner.js`)
A utility class that handles QR code parsing and validation:

**Methods:**
- `initializeScanner(readerId)` - Initialize the QR scanner
- `startScanning(readerId, onSuccess, onError)` - Start camera scanning
- `stopScanning()` - Stop camera scanning
- `parseTransferQR(qrData)` - Parse transfer QR codes
- `parseDepositQR(qrData)` - Parse deposit QR codes
- `validateTransactionQR(qrData)` - Validate if QR is a transaction QR

### Libraries Used
1. **html5-qrcode** - Camera-based QR code scanning
   - URL: `https://unpkg.com/html5-qrcode@latest/dist/html5-qrcode.min.js`

2. **QRCode.js** - QR code generation
   - URL: `https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js`

---

## Browser Support
- Chrome/Edge: ✅ Full support (camera required)
- Firefox: ✅ Full support (camera required)
- Safari: ⚠️ Limited support (iOS 11+)
- Mobile browsers: ✅ Recommended for scanning

## Security Considerations

1. **Validation**: All QR codes are validated to ensure they start with `transfer:` or `deposit:`
2. **No Real Transactions**: The scanner pre-fills forms only. Users must confirm and submit manually.
3. **Camera Permissions**: Users must grant camera permissions for scanning to work
4. **Offline Ready**: QR generation works offline; scanning requires camera access

## Testing the Feature

### Test Scenario 1: Scan Transfer QR
1. Go to Dashboard → Scan QR → Generate QR Code
2. Select "Transfer"
3. Download or open the QR code
4. Go to Transfer page
5. Click "Scan Recipient QR Code"
6. Scan the generated QR code
7. Verify details are populated

### Test Scenario 2: Scan Deposit QR
1. Go to Deposit page
2. Select a deposit method
3. Click "Scan Sender QR Code"
4. Use a generated deposit QR code
5. Verify sender details are populated

---

## Troubleshooting

### Camera Not Working
- Check browser permissions for camera access
- Ensure `https://` is used (camera requires secure context)
- Try a different browser
- Restart the browser and grant permissions

### QR Code Not Scanning
- Ensure QR code format is correct (starts with `transfer:` or `deposit:`)
- Keep QR code in focus within the frame
- Ensure adequate lighting
- Try moving device closer to QR code

### Form Not Pre-filling
- Check browser console for errors
- Verify `qr-transaction-scanner.js` is loaded
- Ensure QR libraries are loaded from CDN
- Check that QR code contains valid data

---

## Future Enhancements

Potential improvements for the QR system:
1. Add QR code history/recent scans
2. Support for bill payment QR codes
3. Batch transaction processing via QR
4. QR code expiration/security features
5. NFC tag support
6. Integration with banking standards (ISO 20022)

---

## Support

For issues or feature requests related to QR code functionality:
1. Check the browser console for error messages
2. Verify all CDN libraries are loading correctly
3. Test in different browsers
4. Ensure camera permissions are granted
