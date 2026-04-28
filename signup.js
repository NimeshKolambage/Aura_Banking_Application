// SIGNUP BACKEND SETUP GUIDE
// Created for Aura Banking Application

/**
 * ============================================================================
 * SIGNUP BACKEND SETUP - QUICK START
 * ============================================================================
 * 
 * You have created a complete signup backend integrated with Supabase.
 * Follow these steps to get it working:
 * 
 */

// ============================================================================
// STEP 1: SETUP SUPABASE DATABASE TABLES (REQUIRED!)
// ============================================================================

/*
1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Open your project: https://zndmjjeirwbmsptgrwhb.supabase.co
3. Click "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy and paste the entire content from: backend/database-schema.sql
6. Click "Run" to execute all the SQL commands

This will create:
✅ profiles table - Stores user profile information
✅ accounts table - Stores bank accounts with auto-generated account numbers
✅ transactions table - Stores transaction history
✅ billers table - Stores saved billers
✅ Row-Level Security (RLS) policies
✅ Auto-update timestamp triggers

Note: Make sure ALL queries execute successfully without errors.
*/

// ============================================================================
// STEP 2: VERIFY YOUR SUPABASE CREDENTIALS
// ============================================================================

/*
Your credentials are already set up in:
- backend/login.js
- backend/signup.js

SUPABASE_URL = 'https://zndmjjeirwbmsptgrwhb.supabase.co'
SUPABASE_ANON_KEY = 'sb_publishable_edTDcROSO8DdrMfO6WsGAg_Uo9-J1OY'

These should be kept secure. In production, use environment variables.
*/

// ============================================================================
// STEP 3: FILE STRUCTURE
// ============================================================================

/*
New files created:
├── backend/
│   ├── signup.js              - Main signup logic with database operations
│   ├── login.js               - Updated with signup backend integration
│   └── database-schema.sql    - SQL schema for Supabase tables
│
├── frontend/
│   └── login.html             - Updated signup form with phone & confirm password

No separate signup page needed - uses same design as login page.
*/

// ============================================================================
// STEP 4: WHAT HAPPENS DURING SIGNUP
// ============================================================================

/*
When a user fills out the signup form and clicks "Sign Up":

1️⃣ VALIDATION
   - Validates all form fields
   - Checks email format
   - Ensures password is 8+ characters
   - Confirms passwords match
   - Validates phone number

2️⃣ EMAIL CHECK
   - Checks if email already exists in database
   - Prevents duplicate registrations

3️⃣ CREATE AUTH USER
   - Creates Supabase Auth account with email/password
   - Sends verification email automatically

4️⃣ CREATE PROFILE
   - Creates user profile record in 'profiles' table
   - Stores: email, full_name, phone_number, account_type, etc.

5️⃣ CREATE BANK ACCOUNT
   - Auto-generates unique account number (9000-XXXXXXXXXX)
   - Creates account in 'accounts' table
   - Sets initial balance to $0.00
   - Marks as primary account

Result: User can now log in after email verification
*/

// ============================================================================
// STEP 5: SIGNUP FORM FIELDS
// ============================================================================

/*
Signup Form Fields (in login.html):
1. Full Name (id: signup-name)
   - Min 2 characters
   - Required

2. Email (id: signup-email)
   - Must be valid email format
   - Must be unique in database
   - Required

3. Phone Number (id: signup-phone)
   - Min 10 digits
   - Format: +1-555-0123 or 5550123
   - Required

4. Password (id: signup-password)
   - Min 8 characters
   - Required

5. Confirm Password (id: signup-confirm-password)
   - Must match password field
   - Required
*/

// ============================================================================
// STEP 6: BACKEND FUNCTIONS
// ============================================================================

/*
Available functions in backend/signup.js:

1. completeSignup(fullName, email, phoneNumber, password, confirmPassword)
   - Main signup function
   - Creates auth user, profile, and account
   - Returns: { success, message, user, profile, account, step }

2. getUserProfile(userId)
   - Gets user profile from database
   - Returns: { success, profile }

3. updateUserProfile(userId, updates)
   - Updates user profile
   - Returns: { success, profile }

4. getUserAccounts(userId)
   - Gets all user bank accounts
   - Returns: { success, accounts }

5. verifyEmailToken(token)
   - Verifies email with confirmation token
   - Returns: { success, message }

6. resendVerificationEmail(email)
   - Resends verification email
   - Returns: { success, message }
*/

// ============================================================================
// STEP 7: TESTING THE SIGNUP
// ============================================================================

/*
Test the signup process:

1. Open login.html in your browser
2. Click "Sign Up" button
3. Fill in the form:
   - Full Name: John Doe
   - Email: testuser@example.com
   - Phone: 555-0123
   - Password: SecurePass123
   - Confirm Password: SecurePass123
4. Click "Sign Up" button
5. You should see: "Account created successfully!"

To verify in Supabase:
1. Go to Supabase Dashboard
2. Click "Authentication" → Check "Users" list
3. Check "profiles" table for new user record
4. Check "accounts" table for new account with account number
*/

// ============================================================================
// STEP 8: EMAIL VERIFICATION SETUP
// ============================================================================

/*
Supabase sends automatic verification emails. To customize:

1. Go to Supabase Dashboard
2. Click "Authentication" → "Email Templates"
3. You can:
   - View verification email template
   - Customize email content
   - Set custom redirect URL
   - Configure custom SMTP (for production)

Current setup uses Supabase's default email provider.
For production, configure your own SMTP server for reliability.
*/

// ============================================================================
// STEP 9: DATABASE SCHEMA DETAILS
// ============================================================================

/*
PROFILES TABLE:
- id (UUID) - User ID from Supabase Auth
- email (VARCHAR) - Unique email address
- full_name (VARCHAR) - User's full name
- phone_number (VARCHAR) - Contact phone
- account_status (VARCHAR) - active/suspended/closed
- email_verified (BOOLEAN) - Email verification status
- created_at (TIMESTAMP) - Account creation time
- updated_at (TIMESTAMP) - Last update time

ACCOUNTS TABLE:
- id (UUID) - Account ID
- user_id (UUID) - Links to profiles table
- account_number (VARCHAR) - Generated account number (UNIQUE)
- account_holder_name (VARCHAR) - Account owner name
- account_type (VARCHAR) - savings/checking/credit
- balance (DECIMAL) - Current balance (starts at 0.00)
- currency (VARCHAR) - Currency code (USD)
- status (VARCHAR) - Account status
- is_primary (BOOLEAN) - Primary account flag
- created_at (TIMESTAMP) - Account creation time
- updated_at (TIMESTAMP) - Last update time

TRANSACTIONS TABLE:
- id (UUID) - Transaction ID
- user_id (UUID) - User who made transaction
- from_account_id (UUID) - Source account
- to_account_id (UUID) - Destination account
- transaction_type (VARCHAR) - transfer/deposit/withdrawal/payment
- amount (DECIMAL) - Transaction amount
- currency (VARCHAR) - Currency code
- status (VARCHAR) - pending/completed/failed
- created_at (TIMESTAMP) - Transaction time

BILLERS TABLE:
- id (UUID) - Biller ID
- user_id (UUID) - User who saved biller
- biller_name (VARCHAR) - Biller name
- biller_category (VARCHAR) - Category
- account_number (VARCHAR) - Biller account number
- is_active (BOOLEAN) - Active status
- created_at (TIMESTAMP) - Creation time
*/

// ============================================================================
// STEP 10: ERROR HANDLING
// ============================================================================

/*
Common errors and solutions:

ERROR: "This email is already registered"
SOLUTION: User already has an account, direct to login page

ERROR: "Password must be at least 8 characters long"
SOLUTION: User entered weak password, ask for stronger one

ERROR: "Passwords do not match"
SOLUTION: Confirm password field doesn't match password

ERROR: "Invalid phone number"
SOLUTION: Phone number must have 10+ digits

ERROR: Database table not found
SOLUTION: Run the SQL schema in Supabase SQL Editor

ERROR: CORS error when calling API
SOLUTION: This is client-side code, CORS shouldn't be an issue. 
Check browser console for details.

ERROR: Email not received
SOLUTION:
- Check Supabase email templates
- Check spam folder
- Wait a few minutes (email can be slow)
- Verify email provider is configured
*/

// ============================================================================
// STEP 11: SECURITY FEATURES
// ============================================================================

/*
✅ Input Validation
   - All fields validated on frontend and backend
   - Invalid inputs rejected before database operations

✅ Row-Level Security (RLS)
   - Users can only access their own data
   - Database policies enforce user isolation
   - Profiles: Users see only their own profile
   - Accounts: Users see only their own accounts
   - Transactions: Users see only their own transactions

✅ Password Security
   - Supabase handles password hashing (bcrypt)
   - Passwords never stored in plain text
   - Email verification required before login

✅ Email Uniqueness
   - Database constraint ensures email is unique
   - Prevents duplicate user accounts

✅ Auto-timestamps
   - created_at: Automatically set on record creation
   - updated_at: Automatically updated on any change
*/

// ============================================================================
// STEP 12: NEXT STEPS
// ============================================================================

/*
After signup is working:

1. Test login with created account
   - User must verify email first
   - Then can log in with email/password

2. Create email verification page (email-verification.html)
   - Handle email confirmation token from link
   - Verify user's email in database

3. Add password reset functionality
   - Already have handlePasswordReset in login.js
   - Create reset password page

4. Create user profile page
   - Display user info from 'profiles' table
   - Allow editing name, phone, address, etc.

5. Create account management page
   - Display accounts from 'accounts' table
   - Show account numbers and balances

6. Add transaction tracking
   - Display transactions from 'transactions' table
   - Create transfer/payment functionality

7. Add biller management
   - Create saved billers in 'billers' table
   - Use for bill payments
*/

// ============================================================================
// STEP 13: PRODUCTION CHECKLIST
// ============================================================================

/*
Before going to production:

[ ] Run database schema in Supabase
[ ] Test signup with real email
[ ] Test email verification
[ ] Test login after verification
[ ] Configure custom SMTP for emails
[ ] Test error handling
[ ] Test with various inputs
[ ] Enable HTTPS
[ ] Set up rate limiting on signup endpoint
[ ] Configure CORS for your domain
[ ] Set up monitoring (Sentry/LogRocket)
[ ] Test RLS policies
[ ] Create backup strategy
[ ] Document API endpoints
[ ] Train support team
*/

// ============================================================================
// END OF SETUP GUIDE
// ============================================================================
