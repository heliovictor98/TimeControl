import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface Demanda {
  id: number;
  nome: string;
  projeto?: { id: number; nome: string } | null;
  created_at: string;
}

const API = '/api/demandas';

@Injectable({ providedIn: 'root' })
export class DemandasService {
  constructor(private http: HttpClient) {}

  listar(projetoId?: number) {
    const params = projetoId != null ? `?projeto_id=${projetoId}` : '';
    return this.http.get<Demanda[]>(`${API}${params}`);
  }

  criar(nome: string, projetoId?: number | null) {
    return this.http.post<Demanda>(API, { nome, projeto_id: projetoId ?? null });
  }

  atualizar(id: number, nome: string, projetoId?: number | null) {
    return this.http.patch<Demanda>(`${API}/${id}`, { nome, projeto_id: projetoId ?? null });
  }

  excluir(id: number) {
    return this.http.delete<void>(`${API}/${id}`);
  }
}
