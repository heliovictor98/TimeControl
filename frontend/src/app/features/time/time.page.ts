import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  RegistrosTimeService,
  RegistroTime,
} from '../../core/services/registros-time.service';

@Component({
  selector: 'app-time-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './time.page.html',
  styleUrl: './time.page.scss',
})
export class TimePage implements OnInit, OnDestroy {
  private readonly api = inject(RegistrosTimeService);

  projeto = signal('');
  demanda = signal('');
  observacao = signal('');
  ativos = signal<RegistroTime[]>([]);
  registrosDia = signal<RegistroTime[]>([]);
  loading = signal(false);
  erro = signal<string | null>(null);

  /** Registro em edição (dados do formulário; time_* em formato datetime-local). */
  editando = signal<{
    id: number;
    projeto: string;
    demanda: string;
    observacao: string;
    time_inicial: string;
    time_final: string;
  } | null>(null);

  salvando = signal(false);

  private tick = signal(0);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  /** Data de hoje em YYYY-MM-DD para carregar registros do dia. */
  hoje = computed(() => {
    const d = new Date();
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0'),
    ].join('-');
  });

  /** Registro em andamento (no máximo um). Fica fora do grid, abaixo do Play. */
  rodando = computed(() => {
    this.tick();
    const lista = this.ativos();
    if (lista.length === 0) return null;
    const r = lista[0];
    const ini = new Date(r.time_inicial).getTime();
    const fim = Date.now();
    const duracao = this.formatarDecorrido(ini, fim);
    return { ...r, duracao, horaInicio: this.formatarHora(r.time_inicial) };
  });

  /** Grid: só registros do dia já encerrados (do menor para o maior). */
  gridRows = computed(() => {
    const lista = this.registrosDia().filter((r) => r.time_final != null);
    return lista.map((r) => {
      const ini = new Date(r.time_inicial).getTime();
      const fim = new Date(r.time_final!).getTime();
      return {
        ...r,
        duracao: this.formatarDecorrido(ini, fim),
        horaInicio: this.formatarHora(r.time_inicial),
        horaFim: this.formatarHora(r.time_final!),
      };
    });
  });

  ngOnInit() {
    this.carregarAtivos();
    this.carregarRegistrosDia();
    this.intervalId = setInterval(() => this.tick.update((n) => n + 1), 1000);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  private formatarDecorrido(inicio: number, fim: number): string {
    const seg = Math.floor((fim - inicio) / 1000);
    const h = Math.floor(seg / 3600);
    const m = Math.floor((seg % 3600) / 60);
    const s = seg % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  private formatarHora(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  /** Converte ISO para valor de input datetime-local (yyyy-MM-ddThh:mm). */
  toDateTimeLocal(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  abrirEdicao(row: { id: number; projeto: string; demanda: string; observacao: string | null; time_inicial: string; time_final: string | null }) {
    if (!row.time_final) return;
    this.editando.set({
      id: row.id,
      projeto: row.projeto,
      demanda: row.demanda,
      observacao: row.observacao ?? '',
      time_inicial: this.toDateTimeLocal(row.time_inicial),
      time_final: this.toDateTimeLocal(row.time_final),
    });
    this.erro.set(null);
  }

  cancelarEdicao() {
    this.editando.set(null);
  }

  salvarEdicao() {
    const e = this.editando();
    if (!e) return;
    if (!e.projeto.trim() || !e.demanda.trim()) {
      this.erro.set('Preencha projeto e demanda.');
      return;
    }
    this.erro.set(null);
    this.salvando.set(true);
    this.api
      .atualizar(e.id, {
        projeto: e.projeto.trim(),
        demanda: e.demanda.trim(),
        observacao: e.observacao.trim() || null,
        time_inicial: new Date(e.time_inicial).toISOString(),
        time_final: new Date(e.time_final).toISOString(),
      })
      .subscribe({
        next: () => {
          this.editando.set(null);
          this.carregarRegistrosDia();
          this.salvando.set(false);
        },
        error: () => {
          this.erro.set('Erro ao salvar.');
          this.salvando.set(false);
        },
      });
  }

  atualizarEditando(key: 'projeto' | 'demanda' | 'observacao' | 'time_inicial' | 'time_final', value: string) {
    this.editando.update((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  private carregarAtivos() {
    this.api.listarAtivos().subscribe({
      next: (lista) => this.ativos.set(lista),
      error: () => this.erro.set('Erro ao carregar registro em andamento'),
    });
  }

  private carregarRegistrosDia() {
    const data = this.hoje();
    this.api.listarPorData(data).subscribe({
      next: (lista) => this.registrosDia.set(lista),
      error: () => this.erro.set('Erro ao carregar registros do dia'),
    });
  }

  play() {
    const p = this.projeto().trim();
    const d = this.demanda().trim();
    if (!p || !d) {
      this.erro.set('Preencha projeto e demanda.');
      return;
    }
    if (this.ativos().length > 0) {
      this.erro.set('Encerre o registro em andamento antes de iniciar outro.');
      return;
    }
    this.erro.set(null);
    this.loading.set(true);
    this.api.iniciar(p, d, this.observacao().trim() || undefined).subscribe({
      next: () => {
        this.carregarAtivos();
        this.carregarRegistrosDia();
        this.projeto.set('');
        this.demanda.set('');
        this.observacao.set('');
        this.loading.set(false);
      },
      error: () => {
        this.erro.set('Erro ao iniciar registro.');
        this.loading.set(false);
      },
    });
  }

  encerrar(id: number) {
    this.api.encerrar(id).subscribe({
      next: () => {
        this.carregarAtivos();
        this.carregarRegistrosDia();
      },
      error: () => this.erro.set('Erro ao encerrar registro.'),
    });
  }

  excluir(id: number) {
    if (!confirm('Excluir este lançamento? Esta ação não pode ser desfeita.')) return;
    this.api.excluir(id).subscribe({
      next: () => {
        this.carregarAtivos();
        this.carregarRegistrosDia();
      },
      error: () => this.erro.set('Erro ao excluir registro.'),
    });
  }
}
