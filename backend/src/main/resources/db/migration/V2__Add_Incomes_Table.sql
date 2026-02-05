-- Add Incomes Table (Missed in V1)
CREATE TABLE IF NOT EXISTS incomes (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  source VARCHAR(255) NOT NULL,
  amount NUMERIC(38,2) NOT NULL,
  date DATE NOT NULL,
  description VARCHAR(255),
  wallet_id BIGINT,
  user_id BIGINT NOT NULL,
  CONSTRAINT fk_incomes_wallet FOREIGN KEY (wallet_id) REFERENCES wallets (id),
  CONSTRAINT fk_incomes_user FOREIGN KEY (user_id) REFERENCES users (id)
);
