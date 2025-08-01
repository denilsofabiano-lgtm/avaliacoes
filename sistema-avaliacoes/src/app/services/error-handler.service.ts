import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor(private snackBar: MatSnackBar) {}

  handleError(error: any, customMessage?: string): string {
    let message = customMessage || 'Ocorreu um erro inesperado';

    // Log completo do erro para debug (evitando object logging)
    console.group('❌ ErrorHandlerService');
    console.log('Error type:', typeof error);
    console.log('Error status:', error?.status);
    console.log('Error message:', error?.message);
    console.log('Error url:', error?.url);
    console.log('Custom message:', customMessage);
    console.log('Has error.error:', !!error?.error);
    console.groupEnd();

    if (error instanceof HttpErrorResponse) {
      // Errors do servidor
      switch (error.status) {
        case 0:
          message = 'Erro de conexão. Verifique se o servidor está funcionando.';
          break;
        case 400:
          message = this.extractErrorMessage(error.error) || 'Dados inválidos';
          break;
        case 401:
          message = 'Não autorizado. Faça login novamente.';
          break;
        case 403:
          message = 'Acesso negado. Você não tem permissão para esta ação.';
          break;
        case 404:
          message = 'Recurso não encontrado ou servidor indisponível';
          break;
        case 409:
          message = this.extractErrorMessage(error.error) || 'Conflito nos dados';
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
          message = this.extractErrorMessage(error.error) || error.message || 'Erro de comunicação com o servidor';
      }
    } else {
      message = this.extractErrorMessage(error) || message;
    }

    this.showError(message);
    return message;
  }

  private extractErrorMessage(error: any): string | null {
    if (!error) return null;

    // Se for string, retorna diretamente
    if (typeof error === 'string') {
      return error;
    }

    // Tenta extrair mensagem de diferentes estruturas
    if (error.message && typeof error.message === 'string') {
      return error.message;
    }

    if (error.error && typeof error.error === 'string') {
      return error.error;
    }

    if (error.error?.message && typeof error.error.message === 'string') {
      return error.error.message;
    }

    if (error.msg && typeof error.msg === 'string') {
      return error.msg;
    }

    if (error.detail && typeof error.detail === 'string') {
      return error.detail;
    }

    // Se chegou até aqui e ainda é um objeto, tenta JSON.stringify como último recurso
    if (typeof error === 'object') {
      try {
        const stringified = JSON.stringify(error);
        if (stringified !== '{}' && stringified !== '[object Object]') {
          return `Erro: ${stringified}`;
        }
      } catch (e) {
        // Se falhar o stringify, ignora
      }
    }

    return null;
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
