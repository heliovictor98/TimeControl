import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistroTime } from './registro-time.entity';
import { RegistrosTimeController } from './registros-time.controller';
import { RegistrosTimeService } from './registros-time.service';

@Module({
  imports: [TypeOrmModule.forFeature([RegistroTime])],
  controllers: [RegistrosTimeController],
  providers: [RegistrosTimeService],
})
export class RegistrosTimeModule {}
