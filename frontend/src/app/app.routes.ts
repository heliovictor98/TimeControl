import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout.component';
import { HistoricoPage } from './features/historico/historico.page';
import { ProjetosPage } from './features/projetos/projetos.page';
import { RelatoriosPage } from './features/relatorios/relatorios.page';
import { TimePage } from './features/time/time.page';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: TimePage },
      { path: 'projetos', component: ProjetosPage },
      { path: 'historico', component: HistoricoPage },
      { path: 'relatorios', component: RelatoriosPage },
    ],
  },
];
