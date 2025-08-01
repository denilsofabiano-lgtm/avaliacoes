export function extractErrorMessage(error: any): string {
  // Log para debug
  console.error('Error details:', error);
  
  // Se já tem uma mensagem processada
  if (error?.message && typeof error.message === 'string' && error.message !== '[object Object]') {
    return error.message;
  }
  
  // Se for string, retorna diretamente
  if (typeof error === 'string') {
    return error;
  }
  
  // Tenta extrair de diferentes estruturas de erro HTTP
  if (error?.error) {
    if (typeof error.error === 'string') {
      return error.error;
    }
    if (error.error.message && typeof error.error.message === 'string') {
      return error.error.message;
    }
    if (error.error.error && typeof error.error.error === 'string') {
      return error.error.error;
    }
  }
  
  // Mensagens específicas por status HTTP
  if (error?.status !== undefined) {
    switch (error.status) {
      case 0:
        return 'Erro de conexão. Servidor indisponível.';
      case 400:
        return 'Dados inválidos';
      case 401:
        return 'Credenciais inválidas ou sessão expirada';
      case 403:
        return 'Acesso negado';
      case 404:
        return 'Recurso não encontrado';
      case 409:
        return 'Conflito nos dados';
      case 422:
        return 'Dados inválidos para processamento';
      case 500:
        return 'Erro interno do servidor';
    }
  }
  
  // Tenta outras propriedades comuns
  if (error?.msg && typeof error.msg === 'string') {
    return error.msg;
  }
  
  if (error?.detail && typeof error.detail === 'string') {
    return error.detail;
  }
  
  // Fallback padrão
  return 'Ocorreu um erro inesperado';
}

export function getHttpStatusMessage(status: number): string {
  switch (status) {
    case 0:
      return 'Erro de conexão. Verifique se o servidor está funcionando.';
    case 400:
      return 'Dados inválidos enviados';
    case 401:
      return 'Credenciais inválidas. Verifique seu e-mail e senha.';
    case 403:
      return 'Acesso negado. Você não tem permissão para esta operação.';
    case 404:
      return 'Recurso não encontrado ou servidor indisponível';
    case 409:
      return 'Conflito nos dados. Recurso já existe.';
    case 422:
      return 'Dados inválidos para processamento';
    case 500:
      return 'Erro interno do servidor. Tente novamente mais tarde.';
    default:
      return 'Erro de comunicação com o servidor';
  }
}
