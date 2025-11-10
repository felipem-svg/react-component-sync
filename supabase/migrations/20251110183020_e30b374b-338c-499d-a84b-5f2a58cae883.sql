-- Adicionar coluna weight à tabela roulette_prizes
ALTER TABLE roulette_prizes 
ADD COLUMN weight INTEGER NOT NULL DEFAULT 10 CHECK (weight >= 1 AND weight <= 100);

-- Atualizar prêmios existentes com peso padrão
UPDATE roulette_prizes SET weight = 10;

-- Adicionar comentário explicativo
COMMENT ON COLUMN roulette_prizes.weight IS 'Peso do prêmio para cálculo de probabilidade (1-100). Quanto maior o peso, maior a chance de ganhar.';