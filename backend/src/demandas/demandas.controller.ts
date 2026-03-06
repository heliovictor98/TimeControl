import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateDemandaDto } from './dto/create-demanda.dto';
import { UpdateDemandaDto } from './dto/update-demanda.dto';
import { DemandasService } from './demandas.service';

@Controller('demandas')
export class DemandasController {
  constructor(private readonly service: DemandasService) {}

  @Post()
  create(@Body() dto: CreateDemandaDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('projeto_id') projetoId?: string) {
    const id = projetoId != null && projetoId !== '' ? parseInt(projetoId, 10) : undefined;
    return this.service.findAll(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(parseInt(id, 10));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDemandaDto) {
    return this.service.update(parseInt(id, 10), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(parseInt(id, 10));
  }
}
