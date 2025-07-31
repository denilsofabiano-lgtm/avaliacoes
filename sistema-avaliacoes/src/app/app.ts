import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Usuario, UserRole } from './models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  
  title = 'Sistema de Avaliações';
  isLoggedIn = false;
  currentUser: Usuario | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Simular usuário logado para desenvolvimento
    this.currentUser = {
      id: 1,
      nome: 'Admin Sistema',
      email: 'admin@sistema.com',
      cpf: '12345678901',
      roles: [UserRole.ROLE_ADMIN],
      status: true
    };
    this.isLoggedIn = true;
  }

  get isAdmin(): boolean {
    return this.currentUser?.roles.includes(UserRole.ROLE_ADMIN) || false;
  }

  get isProfessor(): boolean {
    return this.currentUser?.roles.includes(UserRole.ROLE_PROFESSOR) || false;
  }

  get isAluno(): boolean {
    return this.currentUser?.roles.includes(UserRole.ROLE_ALUNO) || false;
  }

  logout(): void {
    this.isLoggedIn = false;
    this.currentUser = null;
    this.router.navigate(['/login']);
  }
}
