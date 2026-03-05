import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, IsNull, Repository } from 'typeorm';
import { CreateRegistroTimeDto } from './dto/create-registro-time.dto';
import { UpdateRegistroTimeDto } from './dto/update-registro-time.dto';
import { RegistroTime } from './registro-time.entity';

@Injectable()
export class RegistrosTimeService {
  constructor(
    @InjectRepository(RegistroTime)
    private readonly repo: Repository<RegistroTime>,
  ) {}

  async iniciar(dto: CreateRegistroTimeDto): Promise<RegistroTime> {
    const registro = this.repo.create({
      projeto: dto.projeto,
      demanda: dto.demanda,
      observacao: dto.observacao ?? null,
      time_inicial: new Date(),
      time_final: null,
    });
    return this.repo.save(registro);
  }

  async listarAtivos(): Promise<RegistroTime[]> {
    return this.repo.find({
      where: { time_final: IsNull() },
      order: { time_inicial: 'DESC' },
    });
  }

  async listarRecentes(limite = 20): Promise<RegistroTime[]> {
    return this.repo.find({
      where: {},
      order: { time_inicial: 'DESC' },
      take: limite,
    });
  }

  /** Lista registros de um dia (data em YYYY-MM-DD), do menor para o maior (time_inicial ASC). */
  async listarPorData(data: string): Promise<RegistroTime[]> {
    const [y, m, d] = data.split('-').map(Number);
    const inicio = new Date(y, m - 1, d, 0, 0, 0, 0);
    const fim = new Date(y, m - 1, d + 1, 0, 0, 0, 0);
    return this.repo.find({
      where: {
        time_inicial: Between(inicio, new Date(fim.getTime() - 1)),
      },
      order: { time_inicial: 'ASC' },
    });
  }

  async encerrar(id: number): Promise<RegistroTime> {
    const registro = await this.repo.findOne({ where: { id } });
    if (!registro) {
      throw new NotFoundException(`Registro ${id} não encontrado`);
    }
    if (registro.time_final) {
      return registro;
    }
    registro.time_final = new Date();
    return this.repo.save(registro);
  }

  async atualizar(id: number, dto: UpdateRegistroTimeDto): Promise<RegistroTime> {
    const registro = await this.repo.findOne({ where: { id } });
    if (!registro) {
      throw new NotFoundException(`Registro ${id} não encontrado`);
    }
    if (dto.projeto !== undefined) registro.projeto = dto.projeto;
    if (dto.demanda !== undefined) registro.demanda = dto.demanda;
    if (dto.observacao !== undefined) registro.observacao = dto.observacao;
    if (dto.time_inicial !== undefined) registro.time_inicial = new Date(dto.time_inicial);
    if (dto.time_final !== undefined) registro.time_final = dto.time_final == null ? null : new Date(dto.time_final);
    return this.repo.save(registro);
  }
}
