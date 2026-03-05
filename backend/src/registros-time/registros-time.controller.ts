import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateRegistroTimeDto } from './dto/create-registro-time.dto';
import { UpdateRegistroTimeDto } from './dto/update-registro-time.dto';
import { RegistrosTimeService } from './registros-time.service';

@Controller('registros-time')
export class RegistrosTimeController {
  constructor(private readonly service: RegistrosTimeService) {}

  @Post()
  iniciar(@Body() dto: CreateRegistroTimeDto) {
    return this.service.iniciar(dto);
  }

  @Get('ativos')
  listarAtivos() {
    return this.service.listarAtivos();
  }

  @Get('por-data/:data')
  listarPorData(@Param('data') data: string) {
    return this.service.listarPorData(data);
  }

  @Get('por-periodo')
  listarPorPeriodo(@Query('inicio') inicio: string, @Query('fim') fim: string) {
    return this.service.listarPorPeriodo(inicio, fim);
  }

  @Get()
  listarRecentes() {
    return this.service.listarRecentes();
  }

  @Patch(':id/encerrar')
  encerrar(@Param('id') id: string) {
    return this.service.encerrar(parseInt(id, 10));
  }

  @Patch(':id')
  atualizar(@Param('id') id: string, @Body() dto: UpdateRegistroTimeDto) {
    return this.service.atualizar(parseInt(id, 10), dto);
  }

  @Delete(':id')
  excluir(@Param('id') id: string) {
    return this.service.excluir(parseInt(id, 10));
  }
}
