-- ==============================================================================
-- DRIVERSAAS - SCHEMA DO BANCO DE DADOS OFICIAL (PostgreSQL / Supabase)
-- Todas as tabelas prefixadas com "xds_" para evitar colisão com outros sistemas
-- ==============================================================================

-- 1. TABELA DE USUÁRIOS (Autenticação e Perfis)
CREATE TABLE IF NOT EXISTS xds_users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(30) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('driver', 'passenger', 'admin')),
    is_admin BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA DE MOTORISTAS (Escudo Jurídico PJ, Veículo e Tarifas)
CREATE TABLE IF NOT EXISTS xds_drivers (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES xds_users(id) ON DELETE CASCADE,
    
    -- Escudo Jurídico PJ Amplo
    company_type VARCHAR(20) NOT NULL CHECK (company_type IN ('MEI', 'ME', 'LTDA', 'SLU', 'EIRELI')),
    cnpj VARCHAR(30) UNIQUE NOT NULL,
    razao_social VARCHAR(200) NOT NULL,
    nome_fantasia VARCHAR(150),
    inscricao_municipal VARCHAR(50),
    
    -- Dados do Veículo
    car_model VARCHAR(100) NOT NULL,
    car_plate VARCHAR(20) NOT NULL,
    car_color VARCHAR(50) NOT NULL,
    car_year VARCHAR(10) NOT NULL,
    
    -- Tarifação Personalizada
    base_price DECIMAL(10,2) DEFAULT 6.00,
    price_per_km DECIMAL(10,2) DEFAULT 2.80,
    
    -- Status Operacional
    is_online BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended')),
    rating DECIMAL(3,2) DEFAULT 5.00,
    total_rides INTEGER DEFAULT 0,
    total_earnings DECIMAL(12,2) DEFAULT 0.00,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABELA DE PASSAGEIROS
CREATE TABLE IF NOT EXISTS xds_passengers (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES xds_users(id) ON DELETE CASCADE,
    cpf VARCHAR(25),
    default_payment_method VARCHAR(30) DEFAULT 'Pix Direto',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABELA DE MOTORISTAS FAVORITOS (Despacho em Cascata)
CREATE TABLE IF NOT EXISTS xds_passenger_favorites (
    id VARCHAR(50) PRIMARY KEY,
    passenger_id VARCHAR(50) NOT NULL REFERENCES xds_passengers(id) ON DELETE CASCADE,
    driver_id VARCHAR(50) NOT NULL REFERENCES xds_drivers(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 1, -- 1: 1º Preferencial, 2: 2º Favorito, 3: 3º Favorito...
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (passenger_id, driver_id)
);

-- 5. TABELA DE PLANOS DE ASSINATURA (Gerenciáveis pelo Admin)
CREATE TABLE IF NOT EXISTS xds_plans (
    id VARCHAR(50) PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly'
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    period_days INTEGER NOT NULL,
    badge VARCHAR(50),
    description TEXT,
    features_json TEXT, -- Lista de benefícios em formato JSON
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABELA DE ASSINATURAS DOS MOTORISTAS
CREATE TABLE IF NOT EXISTS xds_subscriptions (
    id VARCHAR(50) PRIMARY KEY,
    driver_id VARCHAR(50) NOT NULL REFERENCES xds_drivers(id) ON DELETE CASCADE,
    plan_id VARCHAR(50) NOT NULL REFERENCES xds_plans(id),
    price_paid DECIMAL(10,2) NOT NULL,
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    payment_method VARCHAR(30) DEFAULT 'Pix',
    pix_code_ref TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABELA DE CONTA DIGITAL / WALLET
CREATE TABLE IF NOT EXISTS xds_wallets (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL REFERENCES xds_users(id) ON DELETE CASCADE,
    available_balance DECIMAL(12,2) DEFAULT 0.00,
    pending_balance DECIMAL(12,2) DEFAULT 0.00,
    blocked_balance DECIMAL(12,2) DEFAULT 0.00,
    pix_key_default VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. TABELA DE TRANSAÇÕES DA CONTA DIGITAL (Ledger Bancário)
CREATE TABLE IF NOT EXISTS xds_wallet_transactions (
    id VARCHAR(50) PRIMARY KEY,
    wallet_id VARCHAR(50) NOT NULL REFERENCES xds_wallets(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL, -- 'ride_credit', 'subscription_debit', 'deposit_pix', 'withdraw_pix'
    amount DECIMAL(10,2) NOT NULL, -- Positivo para crédito, negativo para débito
    title VARCHAR(150) NOT NULL,
    method VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    ref_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. TABELA DE CORRIDAS (Transporte Individual Particular)
CREATE TABLE IF NOT EXISTS xds_rides (
    id VARCHAR(50) PRIMARY KEY,
    contract_number VARCHAR(50) UNIQUE NOT NULL,
    driver_id VARCHAR(50) REFERENCES xds_drivers(id),
    passenger_id VARCHAR(50) REFERENCES xds_passengers(id),
    passenger_name VARCHAR(150) NOT NULL,
    passenger_phone VARCHAR(30) NOT NULL,
    origin_address TEXT NOT NULL,
    destination_address TEXT NOT NULL,
    distance_km DECIMAL(6,2) NOT NULL,
    duration_min INTEGER NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
    payment_method VARCHAR(30) DEFAULT 'Pix Direto',
    payment_status VARCHAR(20) DEFAULT 'confirmed' CHECK (payment_status IN ('pending', 'confirmed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 10. TABELA DE CONTRATOS ELETRÔNICOS (Escudo Jurídico Leis 12.587/12 e 13.640/18)
CREATE TABLE IF NOT EXISTS xds_contracts (
    id VARCHAR(50) PRIMARY KEY,
    ride_id VARCHAR(50) UNIQUE NOT NULL REFERENCES xds_rides(id) ON DELETE CASCADE,
    contract_number VARCHAR(50) UNIQUE NOT NULL,
    driver_company_name VARCHAR(200) NOT NULL,
    driver_cnpj VARCHAR(30) NOT NULL,
    driver_name VARCHAR(150) NOT NULL,
    driver_car VARCHAR(100) NOT NULL,
    driver_plate VARCHAR(20) NOT NULL,
    passenger_name VARCHAR(150) NOT NULL,
    passenger_phone VARCHAR(30) NOT NULL,
    origin_address TEXT NOT NULL,
    destination_address TEXT NOT NULL,
    distance_km DECIMAL(6,2) NOT NULL,
    duration_min INTEGER NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    hash_sha256 VARCHAR(64) NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- CARGA INICIAL DE PLANOS (Valores Oficiais)
-- ==============================================================================
INSERT INTO xds_plans (id, slug, name, price, period_days, badge, description, features_json, is_popular, is_active)
VALUES
('plan_01', 'daily', 'Diário', 9.90, 1, NULL, 'Perfeito para testar ou rodar em dias específicos.', '["Acesso completo por 24 horas", "Taxa 0% em todas as corridas", "Emissão de Contratos PJ ilimitados", "Recebimento direto via Pix"]', FALSE, TRUE),
('plan_02', 'weekly', 'Semanal', 29.90, 7, 'Econômico', 'Flexibilidade semanal para quem roda com frequência.', '["Acesso completo por 7 dias", "Corridas ilimitadas com taxa 0%", "Escudo Jurídico com Contrato Digital PJ", "Suporte via WhatsApp", "Economia de 57% comparado ao diário"]', FALSE, TRUE),
('plan_03', 'monthly', 'Mensal', 79.90, 30, 'Mais Popular', 'O plano favorito dos motoristas profissionais.', '["Acesso completo por 30 dias contínuos", "Taxa zero em 100% das viagens", "Contrato em conformidade com Leis Federais", "Suporte Prioritário 24/7", "Selo Motorista Verificado"]', TRUE, TRUE),
('plan_04', 'yearly', 'Anual', 699.90, 365, '2 Meses Grátis', 'Máxima economia para profissionais dedicados.', '["Acesso completo por 1 ano", "2 meses inteiramente grátis", "Suporte VIP dedicado", "Sem reajuste de preço por 12 meses", "Relatórios consolidados para ME/MEI"]', FALSE, TRUE)
ON CONFLICT (slug) DO UPDATE 
SET price = EXCLUDED.price, name = EXCLUDED.name, description = EXCLUDED.description;

-- ==============================================================================
-- POLÍTICAS RLS (Permitir acesso completo com chave anon da API)
-- ==============================================================================
ALTER TABLE xds_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Anon Access xds_users" ON xds_users;
CREATE POLICY "Public Anon Access xds_users" ON xds_users FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE xds_drivers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Anon Access xds_drivers" ON xds_drivers;
CREATE POLICY "Public Anon Access xds_drivers" ON xds_drivers FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE xds_passengers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Anon Access xds_passengers" ON xds_passengers;
CREATE POLICY "Public Anon Access xds_passengers" ON xds_passengers FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE xds_passenger_favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Anon Access xds_passenger_favorites" ON xds_passenger_favorites;
CREATE POLICY "Public Anon Access xds_passenger_favorites" ON xds_passenger_favorites FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE xds_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Anon Access xds_plans" ON xds_plans;
CREATE POLICY "Public Anon Access xds_plans" ON xds_plans FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE xds_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Anon Access xds_subscriptions" ON xds_subscriptions;
CREATE POLICY "Public Anon Access xds_subscriptions" ON xds_subscriptions FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE xds_wallets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Anon Access xds_wallets" ON xds_wallets;
CREATE POLICY "Public Anon Access xds_wallets" ON xds_wallets FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE xds_wallet_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Anon Access xds_wallet_transactions" ON xds_wallet_transactions;
CREATE POLICY "Public Anon Access xds_wallet_transactions" ON xds_wallet_transactions FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE xds_rides ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Anon Access xds_rides" ON xds_rides;
CREATE POLICY "Public Anon Access xds_rides" ON xds_rides FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE xds_contracts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Anon Access xds_contracts" ON xds_contracts;
CREATE POLICY "Public Anon Access xds_contracts" ON xds_contracts FOR ALL USING (true) WITH CHECK (true);

-- Habilita Supabase Realtime para a tabela de corridas
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE xds_rides;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
