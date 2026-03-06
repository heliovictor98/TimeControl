import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjetosService, Projeto } from '../../core/services/projetos.service';
import { DemandasService, Demanda } from '../../core/services/demandas.service';

@Component({
  selector: 'app-projetos-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projetos.page.html',
  styleUrl: './projetos.page.scss',
})
export class ProjetosPage implements OnInit {
  private readonly projetosApi = inject(ProjetosService);
  private readonly demandasApi = inject(DemandasService);

  projetos = signal<Projeto[]>([]);
  demandas = signal<Demanda[]>([]);
  loading = signal(false);
  erro = signal<string | null>(null);

  /** Formulário novo projeto */
  novoNome = signal('');
  editandoId = signal<number | null>(null);
  editandoNome = signal('');

  /** Formulário nova demanda */
  novaDemandaNome = signal('');
  novaDemandaProjetoId = signal<number | null>(null);
  editandoDemandaId = signal<number | null>(null);
  editandoDemandaNome = signal('');
  editandoDemandaProjetoId = signal<number | null>(null);

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.projetosApi.listar().subscribe({
      next: (p) => this.projetos.set(p),
      error: () => this.erro.set('Erro ao carregar projetos'),
    });
    this.demandasApi.listar().subscribe({
      next: (d) => this.demandas.set(d),
      error: () => this.erro.set('Erro ao carregar demandas'),
    });
  }

  nomeProjeto(d: Demanda): string {
    const id = d.projeto?.id ?? null;
    if (id == null) return '—';
    return this.projetos().find((p) => p.id === id)?.nome ?? '—';
  }

  criarProjeto() {
    const nome = this.novoNome().trim();
    if (!nome) {
      this.erro.set('Informe o nome do projeto.');
      return;
    }
    this.erro.set(null);
    this.loading.set(true);
    this.projetosApi.criar(nome).subscribe({
      next: () => {
        this.novoNome.set('');
        this.carregar();
        this.loading.set(false);
      },
      error: () => {
        this.erro.set('Erro ao criar projeto.');
        this.loading.set(false);
      },
    });
  }

  abrirEdicaoProjeto(p: Projeto) {
    this.editandoId.set(p.id);
    this.editandoNome.set(p.nome);
  }

  cancelarEdicaoProjeto() {
    this.editandoId.set(null);
  }

  salvarProjeto() {
    const id = this.editandoId();
    const nome = this.editandoNome().trim();
    if (id == null || !nome) return;
    this.projetosApi.atualizar(id, nome).subscribe({
      next: () => {
        this.editandoId.set(null);
        this.carregar();
      },
      error: () => this.erro.set('Erro ao salvar projeto.'),
    });
  }

  excluirProjeto(id: number) {
    if (!confirm('Excluir este projeto? Demandas vinculadas ficarão sem projeto.')) return;
    this.projetosApi.excluir(id).subscribe({
      next: () => this.carregar(),
      error: () => this.erro.set('Erro ao excluir projeto.'),
    });
  }

  criarDemanda() {
    const nome = this.novaDemandaNome().trim();
    if (!nome) {
      this.erro.set('Informe o nome da demanda.');
      return;
    }
    this.erro.set(null);
    this.loading.set(true);
    this.demandasApi.criar(nome, this.novaDemandaProjetoId() ?? undefined).subscribe({
      next: () => {
        this.novaDemandaNome.set('');
        this.novaDemandaProjetoId.set(null);
        this.carregar();
        this.loading.set(false);
      },
      error: () => {
        this.erro.set('Erro ao criar demanda.');
        this.loading.set(false);
      },
    });
  }

  abrirEdicaoDemanda(d: Demanda) {
    this.editandoDemandaId.set(d.id);
    this.editandoDemandaNome.set(d.nome);
    this.editandoDemandaProjetoId.set(d.projeto?.id ?? null);
  }

  cancelarEdicaoDemanda() {
    this.editandoDemandaId.set(null);
  }

  salvarDemanda() {
    const id = this.editandoDemandaId();
    const nome = this.editandoDemandaNome().trim();
    if (id == null || !nome) return;
    this.demandasApi.atualizar(id, nome, this.editandoDemandaProjetoId() ?? undefined).subscribe({
      next: () => {
        this.editandoDemandaId.set(null);
        this.carregar();
      },
      error: () => this.erro.set('Erro ao salvar demanda.'),
    });
  }

  excluirDemanda(id: number) {
    if (!confirm('Excluir esta demanda?')) return;
    this.demandasApi.excluir(id).subscribe({
      next: () => this.carregar(),
      error: () => this.erro.set('Erro ao excluir demanda.'),
    });
  }
}
