import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout.component';
import { HistoricoPage } from './features/historico/historico.page';
import { RelatoriosPage } from './features/relatorios/relatorios.page';
import { TimePage } from './features/time/time.page';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: TimePage },
      { path: 'historico', component: HistoricoPage },
      { path: 'relatorios', component: RelatoriosPage },
    ],
  },
];
