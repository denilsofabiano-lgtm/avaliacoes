export function formatDate(date: Date | string | undefined | null): string {
  if (!date) return '';
  
  try {
    // Se for string, converter para Date
    let dateObj: Date;
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }
    
    // Verificar se a data é válida
    if (isNaN(dateObj.getTime())) {
      return 'Data inválida';
    }
    
    return new Intl.DateTimeFormat('pt-BR').format(dateObj);
  } catch (error) {
    console.log('Error formatting date:', date, error);
    return 'Data inválida';
  }
}

export function formatDateTime(date: Date | string | undefined | null): string {
  if (!date) return '';
  
  try {
    // Se for string, converter para Date
    let dateObj: Date;
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }
    
    // Verificar se a data é válida
    if (isNaN(dateObj.getTime())) {
      return 'Data inválida';
    }
    
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  } catch (error) {
    console.log('Error formatting date/time:', date, error);
    return 'Data inválida';
  }
}

export function formatDateOnly(date: Date | string | undefined | null): string {
  if (!date) return '';
  
  try {
    // Se for string, converter para Date
    let dateObj: Date;
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }
    
    // Verificar se a data é válida
    if (isNaN(dateObj.getTime())) {
      return 'Data inválida';
    }
    
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(dateObj);
  } catch (error) {
    console.log('Error formatting date only:', date, error);
    return 'Data inválida';
  }
}

export function isValidDate(date: any): boolean {
  if (!date) return false;
  
  try {
    let dateObj: Date;
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return false;
    }
    
    return !isNaN(dateObj.getTime());
  } catch (error) {
    return false;
  }
}
