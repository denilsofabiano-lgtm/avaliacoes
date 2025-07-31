import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/usuario.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title class="login-title">
            <mat-icon>school</mat-icon>
            Sistema de Avaliações
          </mat-card-title>
          <mat-card-subtitle>Faça login para continuar</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field class="full-width">
              <mat-label>E-mail</mat-label>
              <input matInput type="email" formControlName="email" placeholder="seu@email.com">
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                E-mail é obrigatório
              </mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                E-mail inválido
              </mat-error>
            </mat-form-field>

            <mat-form-field class="full-width">
              <mat-label>Senha</mat-label>
              <input matInput 
                     [type]="hidePassword ? 'password' : 'text'" 
                     formControlName="senha" 
                     placeholder="Sua senha">
              <button mat-icon-button matSuffix 
                      type="button"
                      (click)="hidePassword = !hidePassword">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('senha')?.hasError('required')">
                Senha é obrigatória
              </mat-error>
            </mat-form-field>

            <button mat-raised-button 
                    color="primary" 
                    type="submit" 
                    class="full-width login-button"
                    [disabled]="loginForm.invalid || isLoading">
              <mat-icon *ngIf="isLoading">refresh</mat-icon>
              {{ isLoading ? 'Entrando...' : 'Entrar' }}
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions class="login-actions">
          <button mat-button color="accent">Esqueci minha senha</button>
        </mat-card-actions>
      </mat-card>

      <div class="demo-accounts">
        <h3>Contas de Demonstração</h3>
        <div class="demo-card">
          <button mat-button (click)="loginAsAdmin()">
            <mat-icon>admin_panel_settings</mat-icon>
            Login como Admin
          </button>
          <button mat-button (click)="loginAsProfessor()">
            <mat-icon>person</mat-icon>
            Login como Professor
          </button>
          <button mat-button (click)="loginAsAluno()">
            <mat-icon>school</mat-icon>
            Login como Aluno
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      margin-bottom: 20px;
    }

    .login-title {
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: center;
      color: #1976d2;
    }

    .login-button {
      margin-top: 16px;
      height: 48px;
    }

    .login-actions {
      justify-content: center;
    }

    .demo-accounts {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
      width: 100%;
      max-width: 400px;
    }

    .demo-accounts h3 {
      margin-top: 0;
      color: #666;
    }

    .demo-card {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .demo-card button {
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: flex-start;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      
      // Simular login
      setTimeout(() => {
        this.isLoading = false;
        this.snackBar.open('Login realizado com sucesso!', 'Fechar', {
          duration: 3000
        });
        this.router.navigate(['/dashboard']);
      }, 1500);
    }
  }

  loginAsAdmin(): void {
    this.loginForm.patchValue({
      email: 'admin@sistema.com',
      senha: 'admin123'
    });
  }

  loginAsProfessor(): void {
    this.loginForm.patchValue({
      email: 'professor@sistema.com',
      senha: 'prof123'
    });
  }

  loginAsAluno(): void {
    this.loginForm.patchValue({
      email: 'aluno@sistema.com',
      senha: 'aluno123'
    });
  }
}
