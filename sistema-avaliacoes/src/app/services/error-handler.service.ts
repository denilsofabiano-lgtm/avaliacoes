import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor(private snackBar: MatSnackBar) {}

  handleError(error: any, customMessage?: string): void {
    let message = customMessage || 'Ocorreu um erro inesperado';
    
    if (error instanceof HttpErrorResponse) {
      // Errors do servidor
      switch (error.status) {
        case 400:
          message = error.error?.error || 'Dados inválidos';
          break;
        case 401:
          message = 'Não autorizado. Faça login novamente.';
          break;
        case 403:
          message = 'Acesso negado. Você não tem permissão para esta ação.';
          break;
        case 404:
          message = 'Recurso não encontrado';
          break;
        case 409:
          message = error.error?.error || 'Conflito nos dados';
          break;
        case 422:
          message = 'Dados inválidos';
          if (error.error?.details && Array.isArray(error.error.details)) {
            message += ': ' + error.error.details.join(', ');
          }
          break;
        case 500:
          message = 'Erro interno do servidor. Tente novamente.';
          break;
        default:
          message = error.error?.error || error.message || 'Erro de comunicação com o servidor';
      }
    } else if (error?.error?.message) {
      message = error.error.message;
    } else if (error?.message) {
      message = error.message;
    }

    this.showError(message);
    console.error('Error details:', error);
  }

  handleSuccess(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}
