import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

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
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'usuarios',
    loadComponent: () => import('./pages/usuarios/usuarios.component').then(m => m.UsuariosComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'avaliacoes',
    loadComponent: () => import('./pages/avaliacoes/avaliacoes.component').then(m => m.AvaliacoesComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'avaliacoes/nova',
    loadComponent: () => import('./pages/avaliacoes/avaliacao-form/avaliacao-form.component').then(m => m.AvaliacaoFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'avaliacoes/:id/editar',
    loadComponent: () => import('./pages/avaliacoes/avaliacao-form/avaliacao-form.component').then(m => m.AvaliacaoFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'questoes',
    loadComponent: () => import('./pages/questoes/questoes.component').then(m => m.QuestoesComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'questoes/nova',
    loadComponent: () => import('./pages/questoes/questao-form/questao-form.component').then(m => m.QuestaoFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'questoes/:id/editar',
    loadComponent: () => import('./pages/questoes/questao-form/questao-form.component').then(m => m.QuestaoFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'aplicacoes',
    loadComponent: () => import('./pages/aplicacoes/aplicacoes.component').then(m => m.AplicacoesComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'aplicacoes/:id/aplicar',
    loadComponent: () => import('./pages/aplicacoes/aplicar-prova/aplicar-prova.component').then(m => m.AplicarProvaComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'configuracoes',
    loadComponent: () => import('./pages/configuracoes/configuracoes.component').then(m => m.ConfiguracoesComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'relatorios',
    loadComponent: () => import('./pages/relatorios/relatorios.component').then(m => m.RelatoriosComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
