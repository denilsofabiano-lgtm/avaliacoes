import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UsuarioService } from '../../../services/usuario.service';
import { Usuario, UserRole } from '../../../models';
import { extractErrorMessage } from '../../../utils/error-utils';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,

    MatProgressSpinnerModule,
    MatCheckboxModule
  ],
  template: `
    <div class="usuario-form-container">
      <mat-card class="form-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>{{ isEditMode ? 'edit' : 'person_add' }}</mat-icon>
            {{ isEditMode ? 'Editar Usuário' : 'Novo Usuário' }}
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="usuarioForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <mat-form-field>
                <mat-label>Nome Completo</mat-label>
                <input matInput formControlName="nome" placeholder="Digite o nome completo">
                <mat-error *ngIf="usuarioForm.get('nome')?.errors?.['required']">
                  Nome é obrigatório
                </mat-error>
                <mat-error *ngIf="usuarioForm.get('nome')?.errors?.['minlength']">
                  Nome deve ter pelo menos 3 caracteres
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field>
                <mat-label>E-mail</mat-label>
                <input matInput type="email" formControlName="email" placeholder="usuario@exemplo.com">
                <mat-error *ngIf="usuarioForm.get('email')?.errors?.['required']">
                  E-mail é obrigatório
                </mat-error>
                <mat-error *ngIf="usuarioForm.get('email')?.errors?.['email']">
                  E-mail inválido
                </mat-error>
              </mat-form-field>

              <mat-form-field>
                <mat-label>CPF</mat-label>
                <input matInput formControlName="cpf" placeholder="000.000.000-00" 
                       (input)="onCpfInput($event)" maxlength="14">
                <mat-error *ngIf="usuarioForm.get('cpf')?.errors?.['required']">
                  CPF é obrigatório
                </mat-error>
                <mat-error *ngIf="usuarioForm.get('cpf')?.errors?.['invalidCpf']">
                  CPF inválido
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row" *ngIf="!isEditMode">
              <mat-form-field>
                <mat-label>Senha</mat-label>
                <input matInput type="password" formControlName="senha" placeholder="Digite a senha">
                <mat-error *ngIf="usuarioForm.get('senha')?.errors?.['required']">
                  Senha é obrigatória
                </mat-error>
                <mat-error *ngIf="usuarioForm.get('senha')?.errors?.['minlength']">
                  Senha deve ter pelo menos 6 caracteres
                </mat-error>
              </mat-form-field>

              <mat-form-field>
                <mat-label>Confirmar Senha</mat-label>
                <input matInput type="password" formControlName="confirmarSenha" placeholder="Confirme a senha">
                <mat-error *ngIf="usuarioForm.get('confirmarSenha')?.errors?.['required']">
                  Confirmação de senha é obrigatória
                </mat-error>
                <mat-error *ngIf="usuarioForm.get('confirmarSenha')?.errors?.['mismatch']">
                  Senhas não coincidem
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field>
                <mat-label>Perfil de Acesso</mat-label>
                <mat-select formControlName="roles" multiple>
                  <mat-option value="ROLE_ADMIN">Administrador</mat-option>
                  <mat-option value="ROLE_PROFESSOR">Professor</mat-option>
                  <mat-option value="ROLE_ALUNO">Aluno</mat-option>
                </mat-select>
                <mat-error *ngIf="usuarioForm.get('roles')?.errors?.['required']">
                  Selecione pelo menos um perfil
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-checkbox formControlName="status">
                Usuário ativo
              </mat-checkbox>
            </div>

            <div class="form-actions">
              <button type="button" mat-button (click)="cancel()">
                <mat-icon>cancel</mat-icon>
                Cancelar
              </button>
              
              <button type="submit" mat-raised-button color="primary" 
                      [disabled]="usuarioForm.invalid || loading">
                <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
                <mat-icon *ngIf="!loading">{{ isEditMode ? 'save' : 'add' }}</mat-icon>
                {{ isEditMode ? 'Atualizar' : 'Criar' }} Usuário
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .usuario-form-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .form-card {
      margin-bottom: 20px;
    }

    mat-card-header {
      margin-bottom: 20px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 24px;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .form-row mat-form-field {
      flex: 1;
    }

    .form-row:last-of-type {
      margin-bottom: 24px;
    }

    .form-actions {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }

    .form-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    @media (max-width: 768px) {
      .usuario-form-container {
        padding: 16px;
      }

      .form-row {
        flex-direction: column;
      }

      .form-actions {
        flex-direction: column;
      }

      .form-actions button {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class UsuarioFormComponent implements OnInit {
  usuarioForm!: FormGroup;
  isEditMode = false;
  loading = false;
  usuarioId?: number;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private usuarioService: UsuarioService,
    private snackBar: MatSnackBar
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.usuarioId = +params['id'];
        this.loadUsuario();
      }
    });
  }

  private initForm(): void {
    this.usuarioForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      cpf: ['', [Validators.required, this.cpfValidator]],
      senha: ['', !this.isEditMode ? [Validators.required, Validators.minLength(6)] : []],
      confirmarSenha: ['', !this.isEditMode ? [Validators.required] : []],
      roles: [[], [Validators.required]],
      status: [true]
    }, { validators: this.passwordMatchValidator });
  }

  private loadUsuario(): void {
    if (!this.usuarioId) return;

    this.loading = true;
    this.usuarioService.getById(this.usuarioId).subscribe({
      next: (usuario) => {
        this.usuarioForm.patchValue({
          nome: usuario.nome,
          email: usuario.email,
          cpf: this.formatCpf(usuario.cpf || ''),
          roles: usuario.roles,
          status: usuario.status
        });
        this.loading = false;
      },
      error: (error) => {
        const message = extractErrorMessage(error);
        this.snackBar.open(message, 'Fechar', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    console.log('🔄 Form submission started');
    console.log('Form valid:', this.usuarioForm.valid);
    console.log('Form errors:', this.usuarioForm.errors);
    console.log('Raw form data:', this.usuarioForm.value);

    if (this.usuarioForm.invalid) {
      console.log('❌ Form is invalid, stopping submission');
      return;
    }

    this.loading = true;
    const formData = this.usuarioForm.value;

    // Remove formatação do CPF
    if (formData.cpf) {
      formData.cpf = formData.cpf.replace(/\D/g, '');
    }

    console.log('📤 Processed form data:', formData);
    
    if (this.isEditMode) {
      delete formData.senha;
      delete formData.confirmarSenha;
      
      this.usuarioService.update(this.usuarioId!, formData).subscribe({
        next: () => {
          this.snackBar.open('Usuário atualizado com sucesso!', 'Fechar', { duration: 3000 });
          this.router.navigate(['/usuarios']);
        },
        error: (error) => {
          const message = extractErrorMessage(error);
          this.snackBar.open(message, 'Fechar', { duration: 5000 });
          this.loading = false;
        }
      });
    } else {
      delete formData.confirmarSenha;
      
      console.log('🔄 Creating user with data:', formData);
      this.usuarioService.create(formData).subscribe({
        next: () => {
          this.snackBar.open('Usuário criado com sucesso!', 'Fechar', { duration: 3000 });
          this.router.navigate(['/usuarios']);
        },
        error: (error) => {
          console.group('❌ UsuarioForm.create Error');
          console.log('Error received in form:', error);
          console.log('Error type:', typeof error);
          console.log('Form data sent:', formData);
          console.groupEnd();

          const message = extractErrorMessage(error);
          console.log('🎯 Create user error message:', message);

          this.snackBar.open(message, 'Fechar', { duration: 5000 });
          this.loading = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/usuarios']);
  }

  onCpfInput(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    event.target.value = value;
    this.usuarioForm.get('cpf')?.setValue(value);
  }

  private formatCpf(cpf: string): string {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  private cpfValidator(control: any) {
    const cpf = control.value?.replace(/\D/g, '');
    if (!cpf || cpf.length !== 11) {
      return { invalidCpf: true };
    }
    return null;
  }

  private passwordMatchValidator(form: FormGroup) {
    if (!form) return null;

    const senha = form.get('senha');
    const confirmarSenha = form.get('confirmarSenha');

    // Se não existem os campos de senha, não validar
    if (!senha || !confirmarSenha) {
      return null;
    }

    // Só validar se ambos os campos têm valores
    if (senha.value && confirmarSenha.value) {
      if (senha.value !== confirmarSenha.value) {
        return { mismatch: true };
      }
    }

    return null;
  }
}
