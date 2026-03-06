import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Projeto } from '../projetos/projeto.entity';

@Entity({ name: 'tb_demandas', schema: 'dbtimecontrol' })
export class Demanda {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nome: string;

  @ManyToOne(() => Projeto, (p) => p.demandas, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'projeto_id' })
  projeto: Projeto | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  created_at: Date;
}
