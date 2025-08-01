export function extractErrorMessage(error: any): string {
  // REGRA PRINCIPAL: NUNCA retornar "[object Object]"

  // Log simplificado
  console.log('🔍 extractErrorMessage called with:', typeof error, error);

  // Casos simples primeiro
  if (!error) {
    return 'Erro desconhecido';
  }

  if (typeof error === 'string') {
    return error || 'Erro sem mensagem';
  }

  // Mensagens por status HTTP (mais comum)
  if (typeof error === 'object' && error.status !== undefined) {
    // Casos específicos para operações de usuário
    if (error.url && error.url.includes('usuarios')) {
      switch (error.status) {
        case 400: return 'Dados do usuário inválidos. Verifique todos os campos.';
        case 409: return 'E-mail ou CPF já cadastrado no sistema.';
        case 422: return 'Formulário contém dados inválidos.';
      }
    }

    // Casos específicos para operações de avaliação
    if (error.url && error.url.includes('avaliacoes')) {
      switch (error.status) {
        case 400: return 'Dados da avaliação inválidos. Verifique os campos.';
        case 403: return 'Sem permissão para esta operação de avaliação.';
        case 404: return 'Avaliação não encontrada.';
        case 409: return 'Conflito: avaliação já existe ou em uso.';
        case 422: return 'Dados da avaliação não puderam ser processados.';
      }
    }

    switch (error.status) {
      case 0: return 'Servidor indisponível. Verifique sua conexão.';
      case 400: return 'Dados inválidos enviados';
      case 401: return 'E-mail ou senha incorretos';
      case 403: return 'Acesso negado';
      case 404: return 'Servidor não encontrado';
      case 409: return 'Dados já existem';
      case 422: return 'Dados inválidos';
      case 500: return 'Erro no servidor. Tente novamente.';
      default: return `Erro de conexão (${error.status})`;
    }
  }

  // Tentar extrair mensagens em ordem de prioridade
  const paths = [
    'message',
    'error.message',
    'error.error',
    'error',
    'msg',
    'detail'
  ];

  for (const path of paths) {
    const value = getNestedValue(error, path);
    if (typeof value === 'string' && value.trim() && value !== '[object Object]') {
      console.log(`✅ Found message at ${path}:`, value);
      return value;
    }
  }

  // Se nada funcionou, criar mensagem padrão baseada no contexto
  if (typeof error === 'object') {
    // Verificar se parece ser erro de login
    if (error.url && error.url.includes('login')) {
      return 'Erro ao fazer login. Verifique suas credenciais.';
    }

    // Verificar se parece ser erro de dashboard
    if (error.url && error.url.includes('dashboard')) {
      return 'Erro ao carregar dados do dashboard.';
    }

    // Verificar se parece ser erro de usuários
    if (error.url && error.url.includes('usuarios')) {
      return 'Erro ao carregar usuários. Servidor indisponível.';
    }

    // Verificar se parece ser erro de avaliações
    if (error.url && error.url.includes('avaliacoes')) {
      return 'Erro ao carregar avaliações. Servidor indisponível.';
    }

    // Fallback genérico
    return 'Erro de comunicação com o servidor';
  }

  return 'Erro inesperado';
}

// Função auxiliar para acessar propriedades aninhadas
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
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

export function logError(context: string, error: any, additionalData?: any): void {
  console.group(`❌ ${context} Error`);
  console.log('Error object:', error);
  console.log('Error status:', error?.status);
  console.log('Error message:', error?.message);
  console.log('Error error:', error?.error);
  if (additionalData) {
    console.log('Additional data:', additionalData);
  }
  console.groupEnd();
}
