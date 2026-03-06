import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface Projeto {
  id: number;
  nome: string;
  created_at: string;
}

const API = '/api/projetos';

@Injectable({ providedIn: 'root' })
export class ProjetosService {
  constructor(private http: HttpClient) {}

  listar() {
    return this.http.get<Projeto[]>(API);
  }

  criar(nome: string) {
    return this.http.post<Projeto>(API, { nome });
  }

  atualizar(id: number, nome: string) {
    return this.http.patch<Projeto>(`${API}/${id}`, { nome });
  }

  excluir(id: number) {
    return this.http.delete<void>(`${API}/${id}`);
  }
}
