import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProjetoDto } from './dto/create-projeto.dto';
import { UpdateProjetoDto } from './dto/update-projeto.dto';
import { Projeto } from './projeto.entity';

@Injectable()
export class ProjetosService {
  constructor(
    @InjectRepository(Projeto)
    private readonly repo: Repository<Projeto>,
  ) {}

  async create(dto: CreateProjetoDto): Promise<Projeto> {
    const projeto = this.repo.create({ nome: dto.nome });
    return this.repo.save(projeto);
  }

  async findAll(): Promise<Projeto[]> {
    return this.repo.find({ order: { nome: 'ASC' } });
  }

  async findOne(id: number): Promise<Projeto> {
    const projeto = await this.repo.findOne({ where: { id }, relations: ['demandas'] });
    if (!projeto) throw new NotFoundException(`Projeto ${id} não encontrado`);
    return projeto;
  }

  async update(id: number, dto: UpdateProjetoDto): Promise<Projeto> {
    const projeto = await this.repo.findOne({ where: { id } });
    if (!projeto) throw new NotFoundException(`Projeto ${id} não encontrado`);
    if (dto.nome !== undefined) projeto.nome = dto.nome;
    return this.repo.save(projeto);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Projeto ${id} não encontrado`);
  }
}
