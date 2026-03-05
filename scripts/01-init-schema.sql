CREATE SCHEMA IF NOT EXISTS dbtimecontrol;

CREATE TABLE IF NOT EXISTS dbtimecontrol.tb_registros_time (
    id              SERIAL PRIMARY KEY,
    projeto         VARCHAR(255) NOT NULL,
    demanda         VARCHAR(255) NOT NULL,
    time_inicial    TIMESTAMP NOT NULL,
    time_final      TIMESTAMP,
    observacao      TEXT,
    created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
