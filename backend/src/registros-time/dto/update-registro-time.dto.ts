export class UpdateRegistroTimeDto {
  projeto?: string;
  demanda?: string;
  observacao?: string;
  /** ISO 8601 (ex: 2026-03-05T13:30:00.000Z) */
  time_inicial?: string;
  /** ISO 8601; null para registro em andamento */
  time_final?: string | null;
}
