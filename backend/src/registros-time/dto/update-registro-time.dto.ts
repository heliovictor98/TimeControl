export class UpdateRegistroTimeDto {
  projeto_id?: number | null;
  demanda_id?: number | null;
  observacao?: string;
  /** ISO 8601 */
  time_inicial?: string;
  /** ISO 8601; null para registro em andamento */
  time_final?: string | null;
}
