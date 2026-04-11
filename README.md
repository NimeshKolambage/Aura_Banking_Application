# Aura Banking Application

A modern, user-friendly digital banking platform built with HTML5, CSS3, and JavaScript. Aura provides a seamless banking experience with intuitive features for account management, money transfers, bill payments, and transaction tracking.

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Pages Overview](#pages-overview)
- [Getting Started](#getting-started)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Banking Features
- **User Authentication**: Secure login and signup with email verification
- **Account Dashboard**: View account balance, recent transactions, and account details
- **Money Transfer**: Send money to other users with ease
- **Bill Payments**: Pay bills to registered billers
- **Deposits**: Mobile check deposits and fund transfers
- **Withdrawals**: Easy cash withdrawal management
- **Transaction History**: Complete record of all past transactions
- **Payment History**: Detailed payment records and reports

### Security & User Experience
- **Forgot Password**: Secure password recovery flow
- **Email Verification**: Two-factor verification for security
- **QR Code Scanner**: Transaction processing via QR codes
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **24/7 Support**: Customer service information readily available

### User Interface
- **Modern Dashboard**: Clean and intuitive main interface
- **Navbar Navigation**: Easy navigation across all pages
- **Services Page**: Overview of all banking services
- **About Us Page**: Company information and values
- **Contact Page**: Customer support contact details

## 📁 Project Structure

```
Aura_Banking_Application/
├── README.md
├── backend/
│   ├── authConfig.js
│   ├── authGuard.js
│   ├── authUtils.js
│   ├── login.js
│   └── supabaseAuth.js
└── frontend/
    ├── components/
    ├── navbar.html & navbar.css
    ├── login.html & login.js & login.css
    ├── mainui.html & mainui.css
    ├── dashboard.html & dashboard.css
    ├── deposit.html & deposit.css
    ├── withdraw.html & withdraw.css
    ├── transfer.html & transfer.css
    ├── billpayment.html & billpayment.css
    ├── paymenthistory.html & paymenthistory.css
    ├── addbiller.html & addbiller.css
    ├── about.html & about.css
    ├── services.html & services.css
    ├── contact.html & contact.css
    ├── forgotpassword.html & forgotpassword.js & forgotpassword.css
    ├── resetpassword.html
    ├── email-verification.html
    ├── qr-transaction-scanner.js
    └── mainui.html & mainui.css
```

## 📄 Pages Overview

| Page | Purpose |
|------|---------|
| **Login** | User authentication and signup |
| **Dashboard** | Main account overview and quick actions |
| **Deposit** | Mobile check deposits and fund transfers |
| **Withdraw** | Cash withdrawal management |
| **Transfer** | Send money to other accounts |
| **Bill Payment** | Pay registered billers |
| **Add Biller** | Register new billers |
| **Payment History** | View past payment records |
| **About Us** | Company information and values |
| **Services** | Overview of banking services |
| **Contact** | Customer support information |
| **Forgot Password** | Secure password recovery |

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js (for backend services)
- Internet connection for API calls

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Aura_Banking_Application.git
   cd Aura_Banking_Application
   ```

2. **Set up the frontend**
   - Open `frontend/mainui.html` in your web browser
   - Or serve the frontend directory using a local server:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js (if http-server is installed)
     http-server frontend
     ```

3. **Set up the backend (if applicable)**
   - Navigate to the backend directory
   - Install dependencies
   - Configure authentication settings in `authConfig.js`
   - Start the backend server

## 💻 Technologies Used

### Frontend
- **HTML5**: Semantic markup and structure
- **CSS3**: Responsive design with custom properties
- **JavaScript**: Interactive features and functionality
- **Font Awesome**: Icon library for UI elements
- **Google Fonts**: Poppins font family

### Backend
- **Node.js**: JavaScript runtime
- **Supabase Auth**: Authentication service
- **Authentication**: Custom auth utilities and guards

### Design System
- **Color Scheme**:
  - Primary: #006A71 (Teal)
  - Secondary: #48A6A7 (Light Teal)
  - Background: #F2EFE7 (Cream)
  - Text: #000000 (Black)
- **Typography**: Poppins font family for all text
- **Spacing**: Consistent 5-20px margins and padding
- **Radius**: 10px border-radius for cards and buttons

## 📱 Usage

### Accessing the Application

1. **Landing Page**: Start at `mainui.html` to see the main interface
2. **Navigation**: Use the navbar to navigate between different sections
3. **Login**: Click "Get Started" to access login/signup page
4. **Dashboard**: After login, access your account dashboard
5. **Features**: Use the navigation to access banking features

### Main Workflows

**Creating an Account**
1. Click "Get Started" on the landing page
2. Enter your email and create a password
3. Verify your email address
4. Complete account setup

**Sending Money**
1. Go to Dashboard
2. Click "Send Money" or navigate to Transfer
3. Enter recipient details and amount
4. Review and confirm transaction

**Managing Bills**
1. Navigate to Bill Payment
2. Add billers if needed (Add Biller page)
3. Select biller and enter payment amount
4. Schedule or process payment

## 🔒 Security Features

- Email verification for account creation
- Secure password reset flow
- FDIC Insurance protection
- Bank-level encryption
- Multi-factor authentication support

## 📞 Support

For customer support, visit the Contact page or use:
- **Phone**: 1-800-AURA-BANK
- **Email**: support@aurabank.com
- **Address**: 123 Finance Street, NY

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📄 Additional Information

- **Current Version**: 1.0.0
- **Last Updated**: April 2025
- **Author**: Aura Banking Team
- **Repository**: [GitHub Link](https://github.com/NimeshKolambage/Aura_Banking_Application)

---

**Important Disclaimer**: This is a demonstration/learning project. For production use, ensure compliance with financial regulations, implement proper security measures, and conduct thorough testing. 
