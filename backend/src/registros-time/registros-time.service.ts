import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, IsNull, Repository } from 'typeorm';
import { CreateRegistroTimeDto } from './dto/create-registro-time.dto';
import { UpdateRegistroTimeDto } from './dto/update-registro-time.dto';
import { RegistroTime } from './registro-time.entity';

const PROJETO_LIVRE = 'Projeto Livre';
const DEMANDA_ZERO = 'Demanda zero';

export type RegistroTimeResponse = Omit<RegistroTime, 'projeto' | 'demanda'> & {
  projeto: string;
  demanda: string;
};

@Injectable()
export class RegistrosTimeService {
  constructor(
    @InjectRepository(RegistroTime)
    private readonly repo: Repository<RegistroTime>,
  ) {}

  private toResponse(r: RegistroTime): RegistroTimeResponse {
    return {
      ...r,
      projeto: r.projeto?.nome ?? PROJETO_LIVRE,
      demanda: r.demanda?.nome ?? DEMANDA_ZERO,
    };
  }

  private getFindOptions() {
    return { relations: ['projeto', 'demanda'] };
  }

  async iniciar(dto: CreateRegistroTimeDto): Promise<RegistroTimeResponse> {
    const registro = this.repo.create({
      projetoId: dto.projeto_id ?? null,
      demandaId: dto.demanda_id ?? null,
      observacao: dto.observacao ?? null,
      time_inicial: new Date(),
      time_final: null,
    });
    const saved = await this.repo.save(registro);
    const withRelations = await this.repo.findOne({
      where: { id: saved.id },
      ...this.getFindOptions(),
    });
    return this.toResponse(withRelations!);
  }

  async listarAtivos(): Promise<RegistroTimeResponse[]> {
    const lista = await this.repo.find({
      where: { time_final: IsNull() },
      order: { time_inicial: 'DESC' },
      ...this.getFindOptions(),
    });
    return lista.map((r) => this.toResponse(r));
  }

  async listarRecentes(limite = 20): Promise<RegistroTimeResponse[]> {
    const lista = await this.repo.find({
      where: {},
      order: { time_inicial: 'DESC' },
      take: limite,
      ...this.getFindOptions(),
    });
    return lista.map((r) => this.toResponse(r));
  }

  /** Lista registros de um dia (data em YYYY-MM-DD), do menor para o maior (time_inicial ASC). */
  async listarPorData(data: string): Promise<RegistroTimeResponse[]> {
    const [y, m, d] = data.split('-').map(Number);
    const inicio = new Date(y, m - 1, d, 0, 0, 0, 0);
    const fim = new Date(y, m - 1, d + 1, 0, 0, 0, 0);
    const lista = await this.repo.find({
      where: {
        time_inicial: Between(inicio, new Date(fim.getTime() - 1)),
      },
      order: { time_inicial: 'ASC' },
      ...this.getFindOptions(),
    });
    return lista.map((r) => this.toResponse(r));
  }

  /** Lista registros de um período (início e fim em YYYY-MM-DD), do menor para o maior (time_inicial ASC). */
  async listarPorPeriodo(inicioStr: string, fimStr: string): Promise<RegistroTimeResponse[]> {
    const [yi, mi, di] = inicioStr.split('-').map(Number);
    const [yf, mf, df] = fimStr.split('-').map(Number);
    const inicio = new Date(yi, mi - 1, di, 0, 0, 0, 0);
    const fim = new Date(yf, mf - 1, df, 23, 59, 59, 999);
    const lista = await this.repo.find({
      where: {
        time_inicial: Between(inicio, fim),
      },
      order: { time_inicial: 'ASC' },
      ...this.getFindOptions(),
    });
    return lista.map((r) => this.toResponse(r));
  }

  async encerrar(id: number): Promise<RegistroTimeResponse> {
    const registro = await this.repo.findOne({ where: { id }, ...this.getFindOptions() });
    if (!registro) {
      throw new NotFoundException(`Registro ${id} não encontrado`);
    }
    if (registro.time_final) {
      return this.toResponse(registro);
    }
    registro.time_final = new Date();
    await this.repo.save(registro);
    const updated = await this.repo.findOne({ where: { id }, ...this.getFindOptions() });
    return this.toResponse(updated!);
  }

  async atualizar(id: number, dto: UpdateRegistroTimeDto): Promise<RegistroTimeResponse> {
    const registro = await this.repo.findOne({ where: { id } });
    if (!registro) {
      throw new NotFoundException(`Registro ${id} não encontrado`);
    }
    if (dto.projeto_id !== undefined) registro.projetoId = dto.projeto_id ?? null;
    if (dto.demanda_id !== undefined) registro.demandaId = dto.demanda_id ?? null;
    if (dto.observacao !== undefined) registro.observacao = dto.observacao;
    if (dto.time_inicial !== undefined) registro.time_inicial = new Date(dto.time_inicial);
    if (dto.time_final !== undefined) registro.time_final = dto.time_final == null ? null : new Date(dto.time_final);
    await this.repo.save(registro);
    const updated = await this.repo.findOne({ where: { id }, ...this.getFindOptions() });
    return this.toResponse(updated!);
  }

  async excluir(id: number): Promise<void> {
    const resultado = await this.repo.delete(id);
    if (resultado.affected === 0) {
      throw new NotFoundException(`Registro ${id} não encontrado`);
    }
  }
}
