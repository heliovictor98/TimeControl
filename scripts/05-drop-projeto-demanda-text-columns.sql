-- Remove colunas de texto projeto e demanda (uso apenas projeto_id e demanda_id)
-- Execute após 04 e após migrar/corrigir dados se necessário.

ALTER TABLE dbtimecontrol.tb_registros_time DROP COLUMN IF EXISTS projeto;
ALTER TABLE dbtimecontrol.tb_registros_time DROP COLUMN IF EXISTS demanda;
