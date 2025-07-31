import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Usuario, UserRole } from '../../models';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <div class="usuarios-container">
      <div class="header-section">
        <h1>Gestão de Usuários</h1>
        <button mat-raised-button color="primary" (click)="addUser()">
          <mat-icon>person_add</mat-icon>
          Novo Usuário
        </button>
      </div>

      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field>
              <mat-label>Buscar</mat-label>
              <input matInput placeholder="Nome, e-mail ou CPF" (keyup)="applyFilter($event)">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Perfil</mat-label>
              <mat-select (selectionChange)="filterByRole($event.value)">
                <mat-option value="">Todos</mat-option>
                <mat-option value="ROLE_ADMIN">Administrador</mat-option>
                <mat-option value="ROLE_PROFESSOR">Professor</mat-option>
                <mat-option value="ROLE_ALUNO">Aluno</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Status</mat-label>
              <mat-select (selectionChange)="filterByStatus($event.value)">
                <mat-option value="">Todos</mat-option>
                <mat-option value="true">Ativo</mat-option>
                <mat-option value="false">Inativo</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="table-card">
        <table mat-table [dataSource]="usuarios" class="users-table" matSort>
          <ng-container matColumnDef="nome">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Nome</th>
            <td mat-cell *matCellDef="let user">{{ user.nome }}</td>
          </ng-container>

          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>E-mail</th>
            <td mat-cell *matCellDef="let user">{{ user.email }}</td>
          </ng-container>

          <ng-container matColumnDef="cpf">
            <th mat-header-cell *matHeaderCellDef>CPF</th>
            <td mat-cell *matCellDef="let user">{{ formatCpf(user.cpf) }}</td>
          </ng-container>

          <ng-container matColumnDef="roles">
            <th mat-header-cell *matHeaderCellDef>Perfis</th>
            <td mat-cell *matCellDef="let user">
              <mat-chip-set>
                <mat-chip *ngFor="let role of user.roles" [color]="getRoleColor(role)">
                  {{ getRoleLabel(role) }}
                </mat-chip>
              </mat-chip-set>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let user">
              <mat-chip [color]="user.status ? 'primary' : 'warn'">
                {{ user.status ? 'Ativo' : 'Inativo' }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="dataCadastro">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Data Cadastro</th>
            <td mat-cell *matCellDef="let user">{{ formatDate(user.dataCadastro) }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Ações</th>
            <td mat-cell *matCellDef="let user">
              <button mat-icon-button matTooltip="Editar" (click)="editUser(user)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button 
                      matTooltip="Alterar Status" 
                      (click)="toggleUserStatus(user)"
                      [color]="user.status ? 'warn' : 'primary'">
                <mat-icon>{{ user.status ? 'block' : 'check_circle' }}</mat-icon>
              </button>
              <button mat-icon-button matTooltip="Excluir" color="warn" (click)="deleteUser(user)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <mat-paginator 
          [pageSizeOptions]="[5, 10, 25, 50]" 
          showFirstLastButtons>
        </mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .usuarios-container {
      padding: 20px;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .filters-card {
      margin-bottom: 20px;
    }

    .filters-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .filters-row mat-form-field {
      min-width: 200px;
    }

    .table-card {
      overflow-x: auto;
    }

    .users-table {
      width: 100%;
    }

    .mat-column-actions {
      width: 150px;
      text-align: center;
    }

    .mat-column-status {
      width: 100px;
    }

    .mat-column-roles {
      min-width: 200px;
    }

    @media (max-width: 768px) {
      .usuarios-container {
        padding: 16px;
      }

      .header-section {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
      }

      .header-section button {
        width: 100%;
      }

      .filters-row {
        flex-direction: column;
      }

      .filters-row mat-form-field {
        width: 100%;
        min-width: unset;
      }

      .table-card {
        margin: 0 -8px;
      }

      .mat-column-cpf,
      .mat-column-dataCadastro {
        display: none;
      }
    }
  `]
})
export class UsuariosComponent implements OnInit {
  displayedColumns: string[] = ['nome', 'email', 'cpf', 'roles', 'status', 'dataCadastro', 'actions'];
  
  usuarios: Usuario[] = [
    {
      id: 1,
      nome: 'João Silva',
      email: 'joao@sistema.com',
      cpf: '12345678901',
      roles: [UserRole.ROLE_ADMIN],
      status: true,
      dataCadastro: new Date('2024-01-15')
    },
    {
      id: 2,
      nome: 'Maria Santos',
      email: 'maria@sistema.com',
      cpf: '98765432109',
      roles: [UserRole.ROLE_PROFESSOR],
      status: true,
      dataCadastro: new Date('2024-02-20')
    },
    {
      id: 3,
      nome: 'Pedro Oliveira',
      email: 'pedro@sistema.com',
      cpf: '11122233344',
      roles: [UserRole.ROLE_ALUNO],
      status: true,
      dataCadastro: new Date('2024-03-10')
    }
  ];

  constructor() {}

  ngOnInit(): void {}

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    console.log('Filtrar por:', filterValue);
  }

  filterByRole(role: string): void {
    console.log('Filtrar por perfil:', role);
  }

  filterByStatus(status: string): void {
    console.log('Filtrar por status:', status);
  }

  addUser(): void {
    console.log('Adicionar novo usuário');
  }

  editUser(user: Usuario): void {
    console.log('Editar usuário:', user);
  }

  toggleUserStatus(user: Usuario): void {
    user.status = !user.status;
    console.log('Status alterado:', user);
  }

  deleteUser(user: Usuario): void {
    console.log('Excluir usuário:', user);
  }

  formatCpf(cpf: string): string {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    return new Intl.DateTimeFormat('pt-BR').format(date);
  }

  getRoleLabel(role: UserRole): string {
    const labels = {
      [UserRole.ROLE_ADMIN]: 'Admin',
      [UserRole.ROLE_PROFESSOR]: 'Professor',
      [UserRole.ROLE_ALUNO]: 'Aluno'
    };
    return labels[role] || role;
  }

  getRoleColor(role: UserRole): 'primary' | 'accent' | 'warn' {
    const colors = {
      [UserRole.ROLE_ADMIN]: 'warn' as const,
      [UserRole.ROLE_PROFESSOR]: 'primary' as const,
      [UserRole.ROLE_ALUNO]: 'accent' as const
    };
    return colors[role] || 'primary';
  }
}
