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
}
