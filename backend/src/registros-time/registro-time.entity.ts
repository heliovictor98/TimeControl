import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'tb_registros_time', schema: 'dbtimecontrol' })
export class RegistroTime {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  projeto: string;

  @Column({ type: 'varchar', length: 255 })
  demanda: string;

  @Column({ type: 'timestamp' })
  time_inicial: Date;

  @Column({ type: 'timestamp', nullable: true })
  time_final: Date | null;

  @Column({ type: 'text', nullable: true })
  observacao: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  created_at: Date;
}
