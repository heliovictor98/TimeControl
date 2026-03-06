-- Projetos e Demandas (demanda pertence a um projeto, opcional)

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
