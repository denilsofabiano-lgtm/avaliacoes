import { extractErrorMessage } from './utils/error-utils';

// Simular diferentes tipos de erro que podem estar causando [object Object]
export function testErrorMessages() {
  console.group('🧪 Testing Error Messages');
  
  // Teste 1: Objeto Error básico
  const error1 = new Error('Teste de erro básico');
  console.log('Test 1 - Basic Error:', extractErrorMessage(error1));
  
  // Teste 2: Objeto simples
  const error2 = { message: 'Erro de objeto simples' };
  console.log('Test 2 - Simple object:', extractErrorMessage(error2));
  
  // Teste 3: HttpErrorResponse simulado
  const error3 = {
    status: 401,
    error: { message: 'Unauthorized' },
    message: 'Http failure response'
  };
  console.log('Test 3 - HTTP Error:', extractErrorMessage(error3));
  
  // Teste 4: Objeto vazio (pode causar [object Object])
  const error4 = {};
  console.log('Test 4 - Empty object:', extractErrorMessage(error4));
  
  // Teste 5: Null/undefined
  console.log('Test 5 - Null:', extractErrorMessage(null));
  console.log('Test 6 - Undefined:', extractErrorMessage(undefined));
  
  // Teste 7: Objeto com estrutura complexa (pode causar [object Object])
  const error7 = {
    error: {
      error: {
        details: ['Campo obrigatório']
      }
    }
  };
  console.log('Test 7 - Complex object:', extractErrorMessage(error7));
  
  // Teste 8: Objeto que pode ser convertido para [object Object]
  const error8 = {
    toString: () => '[object Object]',
    status: 500
  };
  console.log('Test 8 - toString object:', extractErrorMessage(error8));
  
  console.groupEnd();
}
