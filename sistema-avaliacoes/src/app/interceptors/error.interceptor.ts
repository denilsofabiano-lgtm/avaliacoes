import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Ocorreu um erro inesperado';

        // Log completo do erro para debug
        console.error('HTTP Error intercepted:', error);

        if (error instanceof HttpErrorResponse) {
          switch (error.status) {
            case 0:
              errorMessage = 'Erro de conexão. Servidor indisponível.';
              break;
            case 400:
              errorMessage = this.extractErrorMessage(error.error) || 'Dados inválidos';
              break;
            case 401:
              errorMessage = 'Credenciais inválidas ou sessão expirada';
              break;
            case 403:
              errorMessage = 'Acesso negado';
              break;
            case 404:
              errorMessage = 'Recurso não encontrado';
              break;
            case 409:
              errorMessage = this.extractErrorMessage(error.error) || 'Conflito nos dados';
              break;
            case 422:
              errorMessage = 'Dados inválidos';
              if (error.error?.details && Array.isArray(error.error.details)) {
                errorMessage += ': ' + error.error.details.join(', ');
              }
              break;
            case 500:
              errorMessage = 'Erro interno do servidor';
              break;
            default:
              errorMessage = this.extractErrorMessage(error.error) || error.message || 'Erro de comunica��ão com servidor';
          }
        } else {
          errorMessage = this.extractErrorMessage(error) || errorMessage;
        }

        // Criar um novo erro com mensagem legível
        const readableError = new Error(errorMessage);
        (readableError as any).status = error.status;
        (readableError as any).originalError = error;

        return throwError(() => readableError);
      })
    );
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
    
    // Se chegou até aqui, tenta extrair do JSON
    if (typeof error === 'object') {
      try {
        const keys = Object.keys(error);
        if (keys.length > 0) {
          const firstKey = keys[0];
          const firstValue = error[firstKey];
          if (typeof firstValue === 'string') {
            return firstValue;
          }
        }
      } catch (e) {
        // Se falhar, ignora
      }
    }
    
    return null;
  }
}
