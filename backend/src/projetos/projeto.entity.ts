import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Demanda } from '../demandas/demanda.entity';

@Entity({ name: 'tb_projetos', schema: 'dbtimecontrol' })
export class Projeto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nome: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  created_at: Date;

  @OneToMany(() => Demanda, (d) => d.projeto)
  demandas: Demanda[];
}
