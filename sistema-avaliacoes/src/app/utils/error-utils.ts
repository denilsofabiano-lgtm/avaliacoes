export function extractErrorMessage(error: any): string {
  // Log para debug completo
  console.group('🔍 Error Debug');
  console.log('Error object:', error);
  console.log('Error type:', typeof error);
  console.log('Error constructor:', error?.constructor?.name);
  console.log('Error keys:', error ? Object.keys(error) : 'null');
  console.groupEnd();

  // Verificação se é null/undefined
  if (!error) {
    return 'Erro desconhecido';
  }

  // Se já tem uma mensagem processada válida
  if (error?.message && typeof error.message === 'string' &&
      error.message !== '[object Object]' &&
      error.message.trim() !== '') {
    console.log('✅ Using error.message:', error.message);
    return error.message;
  }

  // Se for string, retorna diretamente
  if (typeof error === 'string' && error.trim() !== '') {
    console.log('✅ Using string error:', error);
    return error;
  }

  // Verificações específicas por status primeiro
  if (error?.status !== undefined) {
    console.log('🔄 Using status-based message for status:', error.status);
    switch (error.status) {
      case 0:
        return 'Erro de conexão. Servidor indisponível.';
      case 400:
        return 'Dados inválidos enviados ao servidor';
      case 401:
        return 'Credenciais inválidas. Verifique seu e-mail e senha.';
      case 403:
        return 'Acesso negado. Você não tem permissão para esta ação.';
      case 404:
        return 'Recurso não encontrado ou servidor indisponível';
      case 409:
        return 'Conflito nos dados. Recurso já existe.';
      case 422:
        return 'Dados inválidos para processamento';
      case 500:
        return 'Erro interno do servidor. Tente novamente mais tarde.';
      default:
        return `Erro HTTP ${error.status}: Problema de comunicação com servidor`;
    }
  }

  // Tenta extrair de diferentes estruturas de erro HTTP
  if (error?.error) {
    console.log('🔄 Checking error.error:', error.error);

    if (typeof error.error === 'string' && error.error.trim() !== '') {
      console.log('✅ Using error.error string:', error.error);
      return error.error;
    }

    if (error.error?.message && typeof error.error.message === 'string' && error.error.message.trim() !== '') {
      console.log('✅ Using error.error.message:', error.error.message);
      return error.error.message;
    }

    if (error.error?.error && typeof error.error.error === 'string' && error.error.error.trim() !== '') {
      console.log('✅ Using error.error.error:', error.error.error);
      return error.error.error;
    }
  }

  // Tenta outras propriedades comuns
  const possibleKeys = ['msg', 'detail', 'description', 'text', 'data'];
  for (const key of possibleKeys) {
    if (error?.[key] && typeof error[key] === 'string' && error[key].trim() !== '') {
      console.log(`✅ Using error.${key}:`, error[key]);
      return error[key];
    }
  }

  // Se chegou até aqui, tentar stringificar o objeto de forma útil
  if (typeof error === 'object' && error !== null) {
    try {
      const stringified = JSON.stringify(error, null, 2);
      if (stringified && stringified !== '{}' && stringified !== 'null') {
        console.log('⚠️ Using stringified error:', stringified);
        return `Erro: ${stringified.substring(0, 200)}${stringified.length > 200 ? '...' : ''}`;
      }
    } catch (e) {
      console.log('❌ Failed to stringify error');
    }
  }

  // Fallback absoluto
  console.log('⚠️ Using fallback message');
  return 'Erro inesperado. Verifique o console para mais detalhes.';
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
