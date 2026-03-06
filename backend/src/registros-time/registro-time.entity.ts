import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Demanda } from '../demandas/demanda.entity';
import { Projeto } from '../projetos/projeto.entity';

@Entity({ name: 'tb_registros_time', schema: 'dbtimecontrol' })
export class RegistroTime {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'projeto_id', nullable: true })
  projetoId: number | null;

  @ManyToOne(() => Projeto, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'projeto_id' })
  projeto: Projeto | null;

  @Column({ type: 'int', name: 'demanda_id', nullable: true })
  demandaId: number | null;

  @ManyToOne(() => Demanda, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'demanda_id' })
  demanda: Demanda | null;

  @Column({ type: 'timestamp' })
  time_inicial: Date;

  @Column({ type: 'timestamp', nullable: true })
  time_final: Date | null;

  @Column({ type: 'text', nullable: true })
  observacao: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  created_at: Date;
}
