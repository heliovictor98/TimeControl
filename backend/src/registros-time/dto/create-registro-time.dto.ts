export class CreateRegistroTimeDto {
  /** Opcional: null = "Projeto Livre" */
  projeto_id?: number | null;
  /** Opcional: null = "Demanda zero" */
  demanda_id?: number | null;
  observacao?: string;
}
