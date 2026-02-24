-- Create contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  address VARCHAR(255) NOT NULL UNIQUE,
  abi JSONB NOT NULL,
  owner_functions JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT FALSE,
  deployed_by VARCHAR(255) NOT NULL,
  deployed_at TIMESTAMP DEFAULT NOW(),
  tx_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create active contract view for quick access
CREATE OR REPLACE VIEW active_contract AS
SELECT * FROM contracts WHERE is_active = TRUE LIMIT 1;

-- Create contract interaction logs
CREATE TABLE IF NOT EXISTS contract_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  function_name VARCHAR(255) NOT NULL,
  caller_address VARCHAR(255) NOT NULL,
  tx_hash VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  result JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS for security
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_interactions ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active contract
CREATE POLICY "Allow public read active contract" 
  ON contracts FOR SELECT 
  USING (is_active = TRUE);

-- Allow authenticated users to read all contracts
CREATE POLICY "Allow authenticated read contracts" 
  ON contracts FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Allow authenticated users to create contracts (admin only should be enforced in app)
CREATE POLICY "Allow authenticated create contracts" 
  ON contracts FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update contracts
CREATE POLICY "Allow authenticated update contracts" 
  ON contracts FOR UPDATE 
  WITH CHECK (auth.role() = 'authenticated');

-- Allow public read interactions
CREATE POLICY "Allow public read interactions" 
  ON contract_interactions FOR SELECT 
  USING (TRUE);

-- Allow authenticated create interactions
CREATE POLICY "Allow authenticated create interactions" 
  ON contract_interactions FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Create indexes for performance
CREATE INDEX idx_contracts_is_active ON contracts(is_active);
CREATE INDEX idx_contracts_address ON contracts(address);
CREATE INDEX idx_interactions_contract_id ON contract_interactions(contract_id);
CREATE INDEX idx_interactions_status ON contract_interactions(status);
