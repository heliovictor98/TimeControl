import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateProjetoDto } from './dto/create-projeto.dto';
import { UpdateProjetoDto } from './dto/update-projeto.dto';
import { ProjetosService } from './projetos.service';

@Controller('projetos')
export class ProjetosController {
  constructor(private readonly service: ProjetosService) {}

  @Post()
  create(@Body() dto: CreateProjetoDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(parseInt(id, 10));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjetoDto) {
    return this.service.update(parseInt(id, 10), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(parseInt(id, 10));
  }
}
