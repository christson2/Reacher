-- Reacher MVP - Supabase PostgreSQL Schema
-- This schema migrates from SQLite to PostgreSQL with Row Level Security (RLS)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- AUTH & USERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  roles VARCHAR(50) DEFAULT 'consumer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);

-- ============================================================================
-- PROFILES
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  avatar_url VARCHAR(500),
  location VARCHAR(255),
  rating DECIMAL(3, 2) DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- ============================================================================
-- PRODUCTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100),
  rating DECIMAL(3, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- ============================================================================
-- PROVIDERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  specialization VARCHAR(255) NOT NULL,
  hourly_rate DECIMAL(8, 2) NOT NULL,
  bio TEXT,
  experience_years INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3, 2) DEFAULT 0,
  completed_jobs INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_providers_user_id ON providers(user_id);
CREATE INDEX IF NOT EXISTS idx_providers_specialization ON providers(specialization);

-- ============================================================================
-- REVIEWS & TRUST
-- ============================================================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewed_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(reviewer_id, reviewed_user_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_user_id ON reviews(reviewed_user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);

CREATE TABLE IF NOT EXISTS trust_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  completion_rate DECIMAL(5, 2) DEFAULT 0,
  response_time_avg INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trust_scores_user_id ON trust_scores(user_id);

-- ============================================================================
-- MESSAGING
-- ============================================================================

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user1_id, user2_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_user1 ON conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user2 ON conversations(user2_id);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  link VARCHAR(500),
  read_status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_status ON notifications(read_status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users: Users can view all, update only themselves
CREATE POLICY "Users can view all users" ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile" ON users FOR UPDATE
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can delete their own account" ON users FOR DELETE
  USING (auth.uid()::text = id::text);

-- Profiles: Users can view all, update/delete only their own
CREATE POLICY "Profiles are viewable by all" ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own profile" ON profiles FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- Products: Anyone can view active, owners can modify
CREATE POLICY "Active products are viewable by all" ON products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Owners can view their own products" ON products FOR SELECT
  USING (auth.uid()::text = seller_id::text);

CREATE POLICY "Owners can insert products" ON products FOR INSERT
  WITH CHECK (auth.uid()::text = seller_id::text);

CREATE POLICY "Owners can update their own products" ON products FOR UPDATE
  USING (auth.uid()::text = seller_id::text);

CREATE POLICY "Owners can delete their own products" ON products FOR DELETE
  USING (auth.uid()::text = seller_id::text);

-- Providers: Anyone can view, owners can modify
CREATE POLICY "Providers are viewable by all" ON providers FOR SELECT
  USING (true);

CREATE POLICY "Owners can insert provider profile" ON providers FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Owners can update their provider profile" ON providers FOR UPDATE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Owners can delete their provider profile" ON providers FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- Reviews: Anyone can view, owners can modify
CREATE POLICY "Reviews are viewable by all" ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews" ON reviews FOR INSERT
  WITH CHECK (auth.uid()::text = reviewer_id::text);

CREATE POLICY "Users can update their own reviews" ON reviews FOR UPDATE
  USING (auth.uid()::text = reviewer_id::text);

CREATE POLICY "Users can delete their own reviews" ON reviews FOR DELETE
  USING (auth.uid()::text = reviewer_id::text);

-- Messages: Users can view/send their own, only sender can delete
CREATE POLICY "Users can view their own messages" ON messages FOR SELECT
  USING (
    auth.uid()::text = sender_id::text OR
    auth.uid()::text = recipient_id::text
  );

CREATE POLICY "Users can send messages" ON messages FOR INSERT
  WITH CHECK (auth.uid()::text = sender_id::text);

CREATE POLICY "Senders can delete their own messages" ON messages FOR DELETE
  USING (auth.uid()::text = sender_id::text);

-- Notifications: Users can view/manage only their own
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own notifications" ON notifications FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to update trust scores when reviews are added/updated
CREATE OR REPLACE FUNCTION update_trust_scores()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO trust_scores (user_id, average_rating, total_reviews)
  SELECT 
    reviewed_user_id,
    ROUND(AVG(rating)::numeric, 2),
    COUNT(*)
  FROM reviews
  WHERE reviewed_user_id = NEW.reviewed_user_id
  ON CONFLICT (user_id) DO UPDATE SET
    average_rating = EXCLUDED.average_rating,
    total_reviews = EXCLUDED.total_reviews,
    updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_trust_scores
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_trust_scores();

-- ============================================================================
-- SEEDING DATA (Optional - for testing)
-- ============================================================================

-- Note: In production, use Supabase Auth for user creation
-- This is just for demonstration purposes
-- Uncomment and modify as needed:

-- INSERT INTO users (id, email, password_hash, name, roles) VALUES
-- ('550e8400-e29b-41d4-a716-446655440001', 'seller@example.com', 'hashed_password_1', 'John Seller', 'seller'),
-- ('550e8400-e29b-41d4-a716-446655440002', 'buyer@example.com', 'hashed_password_2', 'Jane Buyer', 'consumer');

-- INSERT INTO profiles (user_id, bio, location) VALUES
-- ('550e8400-e29b-41d4-a716-446655440001', 'Experienced seller', 'Lagos, Nigeria'),
-- ('550e8400-e29b-41d4-a716-446655440002', 'Regular buyer', 'Abuja, Nigeria');
