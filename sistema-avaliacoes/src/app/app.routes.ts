import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'usuarios',
    loadComponent: () => import('./pages/usuarios/usuarios.component').then(m => m.UsuariosComponent)
  },
  {
    path: 'avaliacoes',
    loadComponent: () => import('./pages/avaliacoes/avaliacoes.component').then(m => m.AvaliacoesComponent)
  },
  {
    path: 'avaliacoes/nova',
    loadComponent: () => import('./pages/avaliacoes/avaliacao-form/avaliacao-form.component').then(m => m.AvaliacaoFormComponent)
  },
  {
    path: 'avaliacoes/:id/editar',
    loadComponent: () => import('./pages/avaliacoes/avaliacao-form/avaliacao-form.component').then(m => m.AvaliacaoFormComponent)
  },
  {
    path: 'questoes',
    loadComponent: () => import('./pages/questoes/questoes.component').then(m => m.QuestoesComponent)
  },
  {
    path: 'questoes/nova',
    loadComponent: () => import('./pages/questoes/questao-form/questao-form.component').then(m => m.QuestaoFormComponent)
  },
  {
    path: 'questoes/:id/editar',
    loadComponent: () => import('./pages/questoes/questao-form/questao-form.component').then(m => m.QuestaoFormComponent)
  },
  {
    path: 'aplicacoes',
    loadComponent: () => import('./pages/aplicacoes/aplicacoes.component').then(m => m.AplicacoesComponent)
  },
  {
    path: 'aplicacoes/:id/aplicar',
    loadComponent: () => import('./pages/aplicacoes/aplicar-prova/aplicar-prova.component').then(m => m.AplicarProvaComponent)
  },
  {
    path: 'configuracoes',
    loadComponent: () => import('./pages/configuracoes/configuracoes.component').then(m => m.ConfiguracoesComponent)
  },
  {
    path: 'relatorios',
    loadComponent: () => import('./pages/relatorios/relatorios.component').then(m => m.RelatoriosComponent)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
