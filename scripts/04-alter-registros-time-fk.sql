-- Adiciona FKs de projeto e demanda na tabela de registros (nullable = Projeto Livre / Demanda zero)

-- Execute após 03-create-projetos-demandas.sql (uma vez)
ALTER TABLE dbtimecontrol.tb_registros_time
  ADD COLUMN projeto_id INT NULL REFERENCES dbtimecontrol.tb_projetos(id) ON DELETE SET NULL;
ALTER TABLE dbtimecontrol.tb_registros_time
  ADD COLUMN demanda_id INT NULL REFERENCES dbtimecontrol.tb_demandas(id) ON DELETE SET NULL;

-- Torna projeto e demanda nullable para compatibilidade (podem ser removidas depois)
ALTER TABLE dbtimecontrol.tb_registros_time
  ALTER COLUMN projeto DROP NOT NULL,
  ALTER COLUMN demanda DROP NOT NULL;
