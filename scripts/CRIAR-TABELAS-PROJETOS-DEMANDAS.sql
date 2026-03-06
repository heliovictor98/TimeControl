-- ============================================================
-- Criação das tabelas de Projetos e Demandas + alteração em tb_registros_time
-- Executar na ordem (schema dbtimecontrol e tb_registros_time já devem existir).
-- ============================================================

-- 1) Tabelas novas
CREATE TABLE IF NOT EXISTS dbtimecontrol.tb_projetos (
    id          SERIAL PRIMARY KEY,
    nome        VARCHAR(255) NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dbtimecontrol.tb_demandas (
    id          SERIAL PRIMARY KEY,
    nome        VARCHAR(255) NOT NULL,
    projeto_id  INT NULL REFERENCES dbtimecontrol.tb_projetos(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2) Adicionar FKs em tb_registros_time (nullable = Projeto Livre / Demanda zero)
ALTER TABLE dbtimecontrol.tb_registros_time
  ADD COLUMN IF NOT EXISTS projeto_id INT NULL REFERENCES dbtimecontrol.tb_projetos(id) ON DELETE SET NULL;

ALTER TABLE dbtimecontrol.tb_registros_time
  ADD COLUMN IF NOT EXISTS demanda_id INT NULL REFERENCES dbtimecontrol.tb_demandas(id) ON DELETE SET NULL;

-- 3) Se a tabela ainda tiver colunas texto projeto/demanda, torná-las nullable (opcional)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'dbtimecontrol' AND table_name = 'tb_registros_time' AND column_name = 'projeto'
  ) THEN
    ALTER TABLE dbtimecontrol.tb_registros_time ALTER COLUMN projeto DROP NOT NULL;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'dbtimecontrol' AND table_name = 'tb_registros_time' AND column_name = 'demanda'
  ) THEN
    ALTER TABLE dbtimecontrol.tb_registros_time ALTER COLUMN demanda DROP NOT NULL;
  END IF;
END $$;

-- 4) Remover colunas de texto projeto e demanda (passar a usar só projeto_id e demanda_id)
ALTER TABLE dbtimecontrol.tb_registros_time DROP COLUMN IF EXISTS projeto;
ALTER TABLE dbtimecontrol.tb_registros_time DROP COLUMN IF EXISTS demanda;
