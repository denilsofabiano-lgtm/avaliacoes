import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Usuario, UserRole } from '../../models';
import { UsuarioService } from '../../services/usuario.service';
import { extractErrorMessage } from '../../utils/error-utils';

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
    MatTooltipModule,

    MatDialogModule,
    MatProgressSpinnerModule
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
        <div *ngIf="loading" class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Carregando usuários...</p>
        </div>

        <div *ngIf="!loading && usuarios.length === 0" class="no-data-container">
          <mat-icon>people_outline</mat-icon>
          <p>Nenhum usuário encontrado</p>
        </div>

        <table mat-table [dataSource]="usuarios" class="users-table" matSort *ngIf="!loading && usuarios.length > 0">
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

    .loading-container,
    .no-data-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      text-align: center;
    }

    .loading-container mat-spinner,
    .no-data-container mat-icon {
      margin-bottom: 16px;
    }

    .no-data-container mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #666;
    }

    .loading-container p,
    .no-data-container p {
      margin: 0;
      color: #666;
      font-size: 16px;
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
  
  usuarios: Usuario[] = [];
  loading = false;
  allUsuarios: Usuario[] = [];

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.loadUsuarios();
  }

  private loadUsuarios(): void {
    this.loading = true;
    this.usuarioService.getAll().subscribe({
      next: (usuarios) => {
        this.allUsuarios = usuarios;
        this.usuarios = usuarios;
        this.loading = false;
      },
      error: (error) => {
        // O erro já é tratado pelo service com fallback ou ErrorHandlerService
        this.loading = false;
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.usuarios = this.allUsuarios.filter(usuario =>
      usuario.nome?.toLowerCase().includes(filterValue) ||
      usuario.email?.toLowerCase().includes(filterValue) ||
      usuario.cpf?.includes(filterValue.replace(/\D/g, ''))
    );
  }

  filterByRole(role: string): void {
    if (role) {
      this.usuarios = this.allUsuarios.filter(usuario =>
        usuario.roles?.includes(role as UserRole)
      );
    } else {
      this.usuarios = [...this.allUsuarios];
    }
  }

  filterByStatus(status: string): void {
    if (status !== '') {
      const isActive = status === 'true';
      this.usuarios = this.allUsuarios.filter(usuario => usuario.status === isActive);
    } else {
      this.usuarios = [...this.allUsuarios];
    }
  }

  addUser(): void {
    this.router.navigate(['/usuarios/novo']);
  }

  editUser(user: Usuario): void {
    this.router.navigate(['/usuarios', user.id, 'editar']);
  }

  toggleUserStatus(user: Usuario): void {
    const newStatus = !user.status;
    const action = newStatus ? 'ativar' : 'desativar';

    if (confirm(`Deseja ${action} o usuário ${user.nome}?`)) {
      this.usuarioService.toggleStatus(user.id!).subscribe({
        next: () => {
          user.status = newStatus;
          this.snackBar.open(`Usuário ${action}do com sucesso!`, 'Fechar', { duration: 3000 });
        },
        error: (error) => {
          this.snackBar.open(`Erro ao ${action} usuário`, 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  deleteUser(user: Usuario): void {
    if (confirm(`Deseja realmente excluir o usuário ${user.nome}? Esta ação não pode ser desfeita.`)) {
      this.usuarioService.delete(user.id!).subscribe({
        next: () => {
          this.snackBar.open('Usuário excluído com sucesso!', 'Fechar', { duration: 3000 });
          this.loadUsuarios();
        },
        error: (error) => {
          this.snackBar.open('Erro ao excluir usuário', 'Fechar', { duration: 3000 });
        }
      });
    }
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
