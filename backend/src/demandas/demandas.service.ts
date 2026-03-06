import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDemandaDto } from './dto/create-demanda.dto';
import { UpdateDemandaDto } from './dto/update-demanda.dto';
import { Demanda } from './demanda.entity';

@Injectable()
export class DemandasService {
  constructor(
    @InjectRepository(Demanda)
    private readonly repo: Repository<Demanda>,
  ) {}

  async create(dto: CreateDemandaDto): Promise<Demanda> {
    const demanda = this.repo.create({
      nome: dto.nome,
      projeto: dto.projeto_id != null ? { id: dto.projeto_id } : null,
    });
    return this.repo.save(demanda);
  }

  async findAll(projetoId?: number): Promise<Demanda[]> {
    const where = projetoId != null ? { projeto: { id: projetoId } } : {};
    return this.repo.find({
      where,
      relations: ['projeto'],
      order: { nome: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Demanda> {
    const demanda = await this.repo.findOne({ where: { id }, relations: ['projeto'] });
    if (!demanda) throw new NotFoundException(`Demanda ${id} não encontrada`);
    return demanda;
  }

  async update(id: number, dto: UpdateDemandaDto): Promise<Demanda> {
    const demanda = await this.repo.findOne({ where: { id } });
    if (!demanda) throw new NotFoundException(`Demanda ${id} não encontrada`);
    if (dto.nome !== undefined) demanda.nome = dto.nome;
    if (dto.projeto_id !== undefined) {
      demanda.projeto = dto.projeto_id != null ? { id: dto.projeto_id } as any : null;
    }
    return this.repo.save(demanda);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Demanda ${id} não encontrada`);
  }
}
