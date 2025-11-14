-- Remove a constraint antiga que está impedindo os updates
ALTER TABLE roulette_prizes DROP CONSTRAINT IF EXISTS roulette_prizes_weight_check;