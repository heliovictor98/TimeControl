import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RegistrosTimeService, RegistroTime } from '../../core/services/registros-time.service';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

type TipoRelatorio = 'dia' | 'semana';

@Component({
  selector: 'app-relatorios-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './relatorios.page.html',
  styleUrl: './relatorios.page.scss',
})
export class RelatoriosPage implements OnInit {
  private readonly api = inject(RegistrosTimeService);

  tipoRelatorio = signal<TipoRelatorio>('semana');
  dataDia = signal<string>(this.hojeStr());
  /** Segunda-feira da semana exibida */
  semanaSegunda = signal<Date>(this.getUltimaSegunda());
  registros = signal<RegistroTime[]>([]);
  loading = signal(false);

  private hojeStr(): string {
    const d = new Date();
    return this.toYYYYMMDD(d);
  }

  /** Retorna a segunda-feira da semana anterior (seg–sex). */
  private getUltimaSegunda(): Date {
    const d = new Date();
    const day = d.getDay();
    const diffSegunda = day === 0 ? -6 : 1 - day;
    const estaSegunda = new Date(d);
    estaSegunda.setDate(d.getDate() + diffSegunda);
    const ultimaSegunda = new Date(estaSegunda);
    ultimaSegunda.setDate(estaSegunda.getDate() - 7);
    return ultimaSegunda;
  }

  private toYYYYMMDD(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  labelSemana = computed(() => {
    const seg = this.semanaSegunda();
    const sex = new Date(seg);
    sex.setDate(seg.getDate() + 4);
    return `Semana de ${this.fmtDia(seg)} a ${this.fmtDia(sex)}`;
  });

  gridRows = computed(() => {
    const lista = this.registros();
    return lista
      .filter((r) => r.time_final != null)
      .map((r) => {
        const ini = new Date(r.time_inicial).getTime();
        const fim = new Date(r.time_final!).getTime();
        const duracao = this.formatarDecorrido(ini, fim);
        return {
          ...r,
          dataStr: this.fmtDia(new Date(r.time_inicial)),
          horaInicio: this.formatarHora(r.time_inicial),
          horaFim: this.formatarHora(r.time_final!),
          duracao,
          segundos: Math.floor((fim - ini) / 1000),
        };
      });
  });

  /** Resumo: total de horas por projeto (para o resumo no topo do PDF). */
  resumoPorProjeto = computed(() => {
    const rows = this.gridRows();
    const map = new Map<string, number>();
    for (const r of rows) {
      const seg = 'segundos' in r ? (r as { segundos: number }).segundos : 0;
      const atual = map.get(r.projeto) ?? 0;
      map.set(r.projeto, atual + seg);
    }
    return Array.from(map.entries())
      .map(([projeto, totalSegundos]) => ({ projeto, totalSegundos }))
      .sort((a, b) => b.totalSegundos - a.totalSegundos);
  });

  ngOnInit() {
    this.carregar();
  }

  private fmtDia(d: Date): string {
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
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

  /** Formata total de segundos como "Xh YYmin" para o resumo. */
  private formatarHorasResumo(segundos: number): string {
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    if (h > 0) return `${h}h ${String(m).padStart(2, '0')}min`;
    return `${m}min`;
  }

  setTipo(tipo: TipoRelatorio) {
    this.tipoRelatorio.set(tipo);
    this.carregar();
  }

  onDataDiaChange(data: string) {
    this.dataDia.set(data);
    this.carregar();
  }

  semanaAnterior() {
    const seg = this.semanaSegunda();
    const nova = new Date(seg);
    nova.setDate(seg.getDate() - 7);
    this.semanaSegunda.set(nova);
    this.carregar();
  }

  semanaProxima() {
    const seg = this.semanaSegunda();
    const nova = new Date(seg);
    nova.setDate(seg.getDate() + 7);
    this.semanaSegunda.set(nova);
    this.carregar();
  }

  carregar() {
    const tipo = this.tipoRelatorio();
    this.loading.set(true);
    if (tipo === 'dia') {
      const data = this.dataDia();
      this.api.listarPorData(data).subscribe({
        next: (lista) => {
          this.registros.set(lista);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    } else {
      const seg = this.semanaSegunda();
      const sex = new Date(seg);
      sex.setDate(seg.getDate() + 4);
      const inicio = this.toYYYYMMDD(seg);
      const fim = this.toYYYYMMDD(sex);
      this.api.listarPorPeriodo(inicio, fim).subscribe({
        next: (lista) => {
          this.registros.set(lista);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    }
  }

  exportarPdf() {
    const rows = this.gridRows();
    if (rows.length === 0) return;
    const tipo = this.tipoRelatorio();
    const resumo = this.resumoPorProjeto();
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const marginLeft = 14;
    let y = 14;

    doc.setFontSize(14);
    if (tipo === 'semana') {
      const seg = this.semanaSegunda();
      const sex = new Date(seg);
      sex.setDate(seg.getDate() + 4);
      doc.text(`Na semana do dia ${this.fmtDia(seg)} a ${this.fmtDia(sex)}`, marginLeft, y);
    } else {
      const d = new Date(this.dataDia() + 'T12:00:00');
      doc.text(`No dia ${this.fmtDia(d)}`, marginLeft, y);
    }
    y += 8;

    doc.setFontSize(11);
    for (const { projeto, totalSegundos } of resumo) {
      doc.text(`${projeto} - ${this.formatarHorasResumo(totalSegundos)}`, marginLeft, y);
      y += 6;
    }
    y += 6;

    doc.setFontSize(12);
    doc.text('Demonstrativo', marginLeft, y);
    y += 8;

    const headers = tipo === 'semana' ? ['Data', 'Projeto', 'Demanda', 'Início', 'Fim', 'Duração', 'Observação'] : ['Projeto', 'Demanda', 'Início', 'Fim', 'Duração', 'Observação'];
    const body = rows.map((r) =>
      tipo === 'semana'
        ? [r.dataStr, r.projeto, r.demanda, r.horaInicio, r.horaFim, r.duracao, r.observacao ?? '']
        : [r.projeto, r.demanda, r.horaInicio, r.horaFim, r.duracao, r.observacao ?? '']
    );
    autoTable(doc, {
      head: [headers],
      body,
      startY: y,
      margin: { left: marginLeft, right: 14 },
      styles: { fontSize: 8 },
    });
    doc.save(`relatorio-timecontrol-${tipo === 'dia' ? this.dataDia() : this.toYYYYMMDD(this.semanaSegunda())}.pdf`);
  }
}
