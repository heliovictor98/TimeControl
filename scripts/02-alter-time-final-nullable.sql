-- Para bancos já criados: permite time_final NULL (registro em andamento)
ALTER TABLE dbtimecontrol.tb_registros_time
  ALTER COLUMN time_final DROP NOT NULL;
