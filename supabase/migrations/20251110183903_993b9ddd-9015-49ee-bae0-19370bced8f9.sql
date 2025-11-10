-- Remover constraint antiga que limita peso a 100
ALTER TABLE roulette_prizes 
DROP CONSTRAINT IF EXISTS roulette_prizes_weight_check;

-- Adicionar nova constraint com limite muito maior (1 a 1.000.000)
ALTER TABLE roulette_prizes
ADD CONSTRAINT roulette_prizes_weight_check 
CHECK (weight >= 1 AND weight <= 1000000);

-- Atualizar comentário da coluna
COMMENT ON COLUMN roulette_prizes.weight IS 'Peso do prêmio para cálculo de probabilidade (1-1000000). Use pesos maiores para criar diferenças extremas de probabilidade.';