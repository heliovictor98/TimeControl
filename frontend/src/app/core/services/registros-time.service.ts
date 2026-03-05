import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface RegistroTime {
  id: number;
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

  iniciar(projeto: string, demanda: string, observacao?: string) {
    return this.http.post<RegistroTime>(API, {
      projeto,
      demanda,
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

  encerrar(id: number) {
    return this.http.patch<RegistroTime>(`${API}/${id}/encerrar`, {});
  }

  atualizar(
    id: number,
    payload: Partial<{
      projeto: string;
      demanda: string;
      observacao: string | null;
      time_inicial: string;
      time_final: string | null;
    }>
  ) {
    return this.http.patch<RegistroTime>(`${API}/${id}`, payload);
  }
}
