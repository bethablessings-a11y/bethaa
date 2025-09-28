-- Create coffee_links table
CREATE TABLE IF NOT EXISTS coffee_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  coffee_link VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255),
  description TEXT,
  goal_amount DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create coffee_payments table
CREATE TABLE IF NOT EXISTS coffee_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_reference VARCHAR(255) UNIQUE NOT NULL,
  coffee_link_id VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  donor_email VARCHAR(255) NOT NULL,
  donor_name VARCHAR(255),
  donor_message TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (coffee_link_id) REFERENCES coffee_links(coffee_link) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coffee_links_user_id ON coffee_links(user_id);
CREATE INDEX IF NOT EXISTS idx_coffee_links_coffee_link ON coffee_links(coffee_link);
CREATE INDEX IF NOT EXISTS idx_coffee_payments_coffee_link_id ON coffee_payments(coffee_link_id);
CREATE INDEX IF NOT EXISTS idx_coffee_payments_status ON coffee_payments(status);

-- Enable Row Level Security (RLS)
ALTER TABLE coffee_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE coffee_payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for coffee_links
CREATE POLICY "Users can view their own coffee links" ON coffee_links
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coffee links" ON coffee_links
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own coffee links" ON coffee_links
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active coffee links" ON coffee_links
  FOR SELECT USING (is_active = true);

-- Create RLS policies for coffee_payments
CREATE POLICY "Users can view payments for their coffee links" ON coffee_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM coffee_links 
      WHERE coffee_links.coffee_link = coffee_payments.coffee_link_id 
      AND coffee_links.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert coffee payments" ON coffee_payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update payment status" ON coffee_payments
  FOR UPDATE USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_coffee_links_updated_at 
  BEFORE UPDATE ON coffee_links 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coffee_payments_updated_at 
  BEFORE UPDATE ON coffee_payments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
