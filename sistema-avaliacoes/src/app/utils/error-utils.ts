export function extractErrorMessage(error: any): string {
  // REGRA PRINCIPAL: NUNCA retornar "[object Object]"

  // Detectar chamadas relacionadas a usuários
  const stackTrace = new Error().stack;
  if (stackTrace && (stackTrace.includes('usuario') || stackTrace.includes('Usuario'))) {
    console.group('🚨 USUÁRIO ERROR DETECTED');
    console.log('Stack trace:', stackTrace);
    console.log('Error received:', error);
    console.log('Error type:', typeof error);
    console.log('Error keys:', error ? Object.keys(error) : 'no keys');
    console.groupEnd();
  }

  // Log simplificado (removido para evitar confusion com [object Object])
  // console.log('🔍 extractErrorMessage called with:', typeof error, error);

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
      let message;
      switch (error.status) {
        case 400: message = 'Dados do usuário inválidos. Verifique todos os campos.'; break;
        case 409: message = 'E-mail ou CPF já cadastrado no sistema.'; break;
        case 422: message = 'Formulário contém dados inválidos.'; break;
      }

      if (message) {
        console.group('🚨 POSSÍVEL ORIGEM: Erro específico de usuário');
        console.log('Error URL:', error.url);
        console.log('Error status:', error.status);
        console.log('Error original:', error);
        console.log('Message returned:', message);
        console.groupEnd();
        return message;
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

  // Tentar extrair mensagens em ordem de prioridade - VERSÃO SEGURA
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
    if (typeof value === 'string' && value.trim() && value !== '[object Object]' && !value.includes('[object')) {
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
      const message = 'Erro ao carregar usuários. Servidor indisponível.';
      console.group('🚨 POSSÍVEL ORIGEM: Erro de usuários detectado');
      console.log('Error URL:', error.url);
      console.log('Error original:', error);
      console.log('Message returned:', message);
      console.groupEnd();
      return message;
    }

    // Verificar se parece ser erro de avaliações
    if (error.url && error.url.includes('avaliacoes')) {
      return 'Erro ao carregar avaliações. Servidor indisponível.';
    }

    // Fallback genérico
    const fallbackMessage = 'Erro de comunicação com o servidor';

    // Log especial para detectar o problema específico
    if (fallbackMessage.includes('buscar') && fallbackMessage.includes('usuário')) {
      console.group('🚨 DETECTADO: Mensagem problemática');
      console.log('Error original:', error);
      console.log('Message returned:', fallbackMessage);
      console.groupEnd();
    }

    return fallbackMessage;
  }

  let finalMessage = 'Erro inesperado';

  // PROTEÇÃO FINAL: Garantir que NUNCA retornamos [object Object]
  if (finalMessage === '[object Object]' || finalMessage.includes('[object Object]')) {
    finalMessage = 'Erro de comunicação com o servidor';
    console.warn('🚨 PREVENIDO: [object Object] foi interceptado e substituído');
  }

  // Log final para detectar quando a mensagem específica está sendo gerada
  if (finalMessage.includes('buscar') && finalMessage.includes('usuário')) {
    console.group('🚨 DETECTADO: Mensagem "buscar usuário" gerada');
    console.log('Error original completo:', error);
    console.log('Error type:', typeof error);
    console.log('Error status:', error?.status);
    console.log('Error message:', error?.message);
    console.log('Error url:', error?.url);
    console.log('Final message:', finalMessage);
    console.trace('Stack trace');
    console.groupEnd();
  }

  return finalMessage;
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
