import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Demanda } from './demanda.entity';
import { DemandasController } from './demandas.controller';
import { DemandasService } from './demandas.service';

@Module({
  imports: [TypeOrmModule.forFeature([Demanda])],
  controllers: [DemandasController],
  providers: [DemandasService],
  exports: [DemandasService],
})
export class DemandasModule {}
