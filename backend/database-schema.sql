-- Supabase Database Schema for Aura Banking
-- Run these SQL commands in the Supabase SQL Editor

-- ===================================
-- 1. PROFILES TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    account_type VARCHAR(50) DEFAULT 'bank_holder',
    account_status VARCHAR(50) DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Backfill/migrate existing profiles table columns (safe to re-run)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_type VARCHAR(50) DEFAULT 'bank_holder';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_status VARCHAR(50) DEFAULT 'active';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_account_status_idx ON profiles(account_status);

-- ===================================
-- 2. ACCOUNTS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    account_number VARCHAR(20) NOT NULL UNIQUE,
    account_holder_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) DEFAULT 'savings',
    balance DECIMAL(15, 2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'active',
    is_primary BOOLEAN DEFAULT FALSE,
    iban VARCHAR(34),
    swift_code VARCHAR(11),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Backfill/migrate existing accounts table columns (safe to re-run)
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS account_holder_name VARCHAR(255);
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS account_type VARCHAR(50) DEFAULT 'savings';
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS balance DECIMAL(15, 2) DEFAULT 0.00;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT FALSE;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS iban VARCHAR(34);
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS swift_code VARCHAR(11);
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'accounts_user_id_fkey'
    ) THEN
        ALTER TABLE accounts
        ADD CONSTRAINT accounts_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS accounts_user_id_idx ON accounts(user_id);
CREATE INDEX IF NOT EXISTS accounts_account_number_idx ON accounts(account_number);
CREATE INDEX IF NOT EXISTS accounts_status_idx ON accounts(status);

-- ===================================
-- 3. TRANSACTIONS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    from_account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    to_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    transaction_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'completed',
    description TEXT,
    reference_number VARCHAR(50),
    recipient_name VARCHAR(255),
    recipient_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Backfill/migrate existing transactions table columns (safe to re-run)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS from_account_id UUID;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS to_account_id UUID;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS transaction_type VARCHAR(50);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS amount DECIMAL(15, 2);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'completed';
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS reference_number VARCHAR(50);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS recipient_name VARCHAR(255);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS recipient_email VARCHAR(255);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'transactions_user_id_fkey'
    ) THEN
        ALTER TABLE transactions
        ADD CONSTRAINT transactions_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'transactions_from_account_id_fkey'
    ) THEN
        ALTER TABLE transactions
        ADD CONSTRAINT transactions_from_account_id_fkey
        FOREIGN KEY (from_account_id) REFERENCES accounts(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'transactions_to_account_id_fkey'
    ) THEN
        ALTER TABLE transactions
        ADD CONSTRAINT transactions_to_account_id_fkey
        FOREIGN KEY (to_account_id) REFERENCES accounts(id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_from_account_idx ON transactions(from_account_id);
CREATE INDEX IF NOT EXISTS transactions_created_at_idx ON transactions(created_at);

-- ===================================
-- 4. BILLERS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS billers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    biller_name VARCHAR(255) NOT NULL,
    biller_category VARCHAR(100),
    account_number VARCHAR(100) NOT NULL,
    biller_code VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Backfill/migrate existing billers table columns (safe to re-run)
ALTER TABLE billers ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE billers ADD COLUMN IF NOT EXISTS biller_name VARCHAR(255);
ALTER TABLE billers ADD COLUMN IF NOT EXISTS biller_category VARCHAR(100);
ALTER TABLE billers ADD COLUMN IF NOT EXISTS account_number VARCHAR(100);
ALTER TABLE billers ADD COLUMN IF NOT EXISTS biller_code VARCHAR(50);
ALTER TABLE billers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE billers ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE billers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'billers_user_id_fkey'
    ) THEN
        ALTER TABLE billers
        ADD CONSTRAINT billers_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS billers_user_id_idx ON billers(user_id);

-- ===================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ===================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies so this script can be re-run safely
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can update own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can create own accounts" ON accounts;

DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;

DROP POLICY IF EXISTS "Users can manage own billers" ON billers;
DROP POLICY IF EXISTS "Users can create own billers" ON billers;
DROP POLICY IF EXISTS "Users can update own billers" ON billers;
DROP POLICY IF EXISTS "Users can delete own billers" ON billers;

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can create own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Accounts Policies
CREATE POLICY "Users can view own accounts" ON accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts" ON accounts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create own accounts" ON accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Transactions Policies
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Billers Policies
CREATE POLICY "Users can manage own billers" ON billers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own billers" ON billers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own billers" ON billers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own billers" ON billers
    FOR DELETE USING (auth.uid() = user_id);

-- ===================================
-- 6. AUTO-UPDATE TIMESTAMP TRIGGER
-- ===================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_billers_updated_at ON billers;
CREATE TRIGGER update_billers_updated_at BEFORE UPDATE ON billers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- 7. AUTO-CREATE PROFILE + ACCOUNT ON AUTH SIGNUP
-- ===================================
-- When email confirmation is enabled, client-side profile/account inserts can fail
-- because there is no authenticated session yet. This trigger runs in DB and
-- safely creates related records for every new auth.users row.

CREATE OR REPLACE FUNCTION generate_unique_account_number()
RETURNS TEXT AS $$
DECLARE
    candidate TEXT;
BEGIN
    LOOP
        candidate := '9000' || LPAD((FLOOR(RANDOM() * 10000000000))::BIGINT::TEXT, 10, '0');
        EXIT WHEN NOT EXISTS (SELECT 1 FROM accounts WHERE account_number = candidate);
    END LOOP;
    RETURN candidate;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    resolved_full_name TEXT;
    new_account_number TEXT;
BEGIN
    resolved_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        SPLIT_PART(NEW.email, '@', 1)
    );

    INSERT INTO profiles (
        id,
        email,
        full_name,
        account_type,
        account_status,
        email_verified,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        resolved_full_name,
        'bank_holder',
        'active',
        COALESCE(NEW.email_confirmed_at IS NOT NULL, FALSE),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;

    new_account_number := generate_unique_account_number();

    INSERT INTO accounts (
        user_id,
        account_number,
        account_holder_name,
        account_type,
        balance,
        currency,
        status,
        is_primary,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        new_account_number,
        resolved_full_name,
        'savings',
        0.00,
        'USD',
        'active',
        TRUE,
        NOW(),
        NOW()
    )
    ON CONFLICT (account_number) DO NOTHING;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_auth_user();
