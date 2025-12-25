/* QR Code Scanner Utility for Transactions */

class TransactionQRScanner {
    constructor() {
        this.html5QrCode = null;
        this.isScanning = false;
    }

    // Initialize QR Scanner
    async initializeScanner(readerId) {
        try {
            this.html5QrCode = new Html5Qrcode(readerId);
            return true;
        } catch (error) {
            console.error('QR Scanner initialization error:', error);
            return false;
        }
    }

    // Start scanning
    async startScanning(readerId, onSuccess, onError) {
        try {
            await this.html5QrCode.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: 250 },
                onSuccess,
                onError
            );
            this.isScanning = true;
            return true;
        } catch (error) {
            console.error('Error starting scanner:', error);
            alert('Camera access denied or not available');
            return false;
        }
    }

    // Stop scanning
    async stopScanning() {
        if (this.html5QrCode && this.isScanning) {
            try {
                await this.html5QrCode.stop();
                this.isScanning = false;
                return true;
            } catch (error) {
                console.error('Error stopping scanner:', error);
                return false;
            }
        }
    }

    // Parse transfer QR code
    parseTransferQR(qrData) {
        try {
            // Format: transfer:recipientAccount:recipientName:amount:reference
            if (!qrData.startsWith('transfer:')) return null;
            
            const parts = qrData.split(':');
            if (parts.length < 4) return null;

            return {
                type: 'transfer',
                recipientAccount: parts[1],
                recipientName: parts[2],
                amount: parts[3],
                reference: parts[4] || ''
            };
        } catch (error) {
            console.error('Error parsing transfer QR:', error);
            return null;
        }
    }

    // Parse deposit QR code
    parseDepositQR(qrData) {
        try {
            // Format: deposit:recipientAccount:bankCode:amount:reference
            if (!qrData.startsWith('deposit:')) return null;
            
            const parts = qrData.split(':');
            if (parts.length < 4) return null;

            return {
                type: 'deposit',
                recipientAccount: parts[1],
                bankCode: parts[2],
                amount: parts[3],
                reference: parts[4] || ''
            };
        } catch (error) {
            console.error('Error parsing deposit QR:', error);
            return null;
        }
    }

    // Validate QR data
    validateTransactionQR(qrData) {
        return qrData.startsWith('transfer:') || qrData.startsWith('deposit:');
    }
}

// Initialize scanner instance
const transactionScanner = new TransactionQRScanner();
