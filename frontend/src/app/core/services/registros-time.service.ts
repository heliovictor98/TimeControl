import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface RegistroTime {
  id: number;
  projetoId: number | null;
  demandaId: number | null;
  projeto: string;
  demanda: string;
  time_inicial: string;
  time_final: string | null;
  observacao: string | null;
  created_at: string;
}

const API = '/api/registros-time';

@Injectable({ providedIn: 'root' })
export class RegistrosTimeService {
  constructor(private http: HttpClient) {}

  iniciar(projetoId: number | null, demandaId: number | null, observacao?: string) {
    return this.http.post<RegistroTime>(API, {
      projeto_id: projetoId,
      demanda_id: demandaId,
      ...(observacao && { observacao }),
    });
  }

  listarAtivos() {
    return this.http.get<RegistroTime[]>(`${API}/ativos`);
  }

  /** Data em YYYY-MM-DD. Retorna registros do dia do menor para o maior (time_inicial ASC). */
  listarPorData(data: string) {
    return this.http.get<RegistroTime[]>(`${API}/por-data/${data}`);
  }

  /** Período em YYYY-MM-DD. Retorna registros do período (time_inicial ASC). */
  listarPorPeriodo(inicio: string, fim: string) {
    return this.http.get<RegistroTime[]>(`${API}/por-periodo?inicio=${encodeURIComponent(inicio)}&fim=${encodeURIComponent(fim)}`);
  }

  encerrar(id: number) {
    return this.http.patch<RegistroTime>(`${API}/${id}/encerrar`, {});
  }

  atualizar(
    id: number,
    payload: Partial<{
      projeto_id: number | null;
      demanda_id: number | null;
      observacao: string | null;
      time_inicial: string;
      time_final: string | null;
    }>
  ) {
    return this.http.patch<RegistroTime>(`${API}/${id}`, payload);
  }

  excluir(id: number) {
    return this.http.delete<void>(`${API}/${id}`);
  }
}
