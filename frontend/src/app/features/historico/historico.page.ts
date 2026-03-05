import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RegistrosTimeService, RegistroTime } from '../../core/services/registros-time.service';

@Component({
  selector: 'app-historico-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historico.page.html',
  styleUrl: './historico.page.scss',
})
export class HistoricoPage {
  private readonly api = inject(RegistrosTimeService);

  /** Mês/ano do calendário exibido */
  mesAno = signal({ ano: new Date().getFullYear(), mes: new Date().getMonth() });

  /** Dia selecionado no calendário (YYYY-MM-DD) ou null */
  diaSelecionado = signal<string | null>(null);

  /** Registros do dia selecionado (do menor para o maior) */
  registrosDia = signal<RegistroTime[]>([]);

  loading = signal(false);
  erro = signal<string | null>(null);

  /** Registro em edição (só para registros encerrados). */
  editando = signal<{
    id: number;
    projeto: string;
    demanda: string;
    observacao: string;
    time_inicial: string;
    time_final: string;
  } | null>(null);

  salvando = signal(false);

  /** Dias do mês para o grid do calendário: array de { dia: number | null, data: string | null } */
  diasCalendario = computed(() => {
    const { ano, mes } = this.mesAno();
    const primeiro = new Date(ano, mes, 1);
    const ultimo = new Date(ano, mes + 1, 0);
    const inicioSemana = primeiro.getDay();
    const totalDias = ultimo.getDate();
    const dias: { dia: number | null; data: string | null }[] = [];
    for (let i = 0; i < inicioSemana; i++) {
      dias.push({ dia: null, data: null });
    }
    for (let d = 1; d <= totalDias; d++) {
      const data = [ano, String(mes + 1).padStart(2, '0'), String(d).padStart(2, '0')].join('-');
      dias.push({ dia: d, data });
    }
    return dias;
  });

  /** Label do mês/ano no header do calendário */
  labelMesAno = computed(() => {
    const { ano, mes } = this.mesAno();
    return new Date(ano, mes).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  });

  /** Linhas da tabela do dia selecionado (com hora e duração formatadas) */
  gridRows = computed(() => {
    const lista = this.registrosDia();
    return lista.map((r) => {
      const ini = new Date(r.time_inicial).getTime();
      const fim = r.time_final ? new Date(r.time_final).getTime() : Date.now();
      const duracao = this.formatarDecorrido(ini, fim);
      return {
        ...r,
        horaInicio: this.formatarHora(r.time_inicial),
        horaFim: r.time_final ? this.formatarHora(r.time_final) : '—',
        duracao,
      };
    });
  });

  anterior() {
    const { ano, mes } = this.mesAno();
    if (mes === 0) {
      this.mesAno.set({ ano: ano - 1, mes: 11 });
    } else {
      this.mesAno.set({ ano, mes: mes - 1 });
    }
  }

  proximo() {
    const { ano, mes } = this.mesAno();
    if (mes === 11) {
      this.mesAno.set({ ano: ano + 1, mes: 0 });
    } else {
      this.mesAno.set({ ano, mes: mes + 1 });
    }
  }

  selecionarDia(data: string | null) {
    if (!data) return;
    this.diaSelecionado.set(data);
    this.carregarRegistros(data);
  }

  carregarRegistros(data: string) {
    this.loading.set(true);
    this.api.listarPorData(data).subscribe({
      next: (lista) => {
        this.registrosDia.set(lista);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
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
    const dia = this.diaSelecionado();
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
          if (dia) this.carregarRegistros(dia);
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

  excluir(id: number) {
    if (!confirm('Excluir este lançamento? Esta ação não pode ser desfeita.')) return;
    const dia = this.diaSelecionado();
    this.api.excluir(id).subscribe({
      next: () => {
        if (dia) this.carregarRegistros(dia);
      },
      error: () => this.erro.set('Erro ao excluir registro.'),
    });
  }
}
