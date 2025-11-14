-- Alterar o tipo do campo weight de INTEGER para NUMERIC(5,2)
-- Isso permitirá valores decimais como 0.05, 0.14, etc.
ALTER TABLE roulette_prizes 
ALTER COLUMN weight TYPE NUMERIC(5,2);