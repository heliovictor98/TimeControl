import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistrosTimeService, RegistroTime } from '../../core/services/registros-time.service';

@Component({
  selector: 'app-historico-page',
  standalone: true,
  imports: [CommonModule],
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

  private carregarRegistros(data: string) {
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
}
