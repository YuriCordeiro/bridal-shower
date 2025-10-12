/**
 * Utilitário para limpar dados de teste e começar com base limpa
 */

export function clearAllTestData() {
  if (typeof window !== 'undefined') {
    // Limpar presentes de teste
    localStorage.removeItem('adminGifts');
    
    // Limpar RSVPs de teste (opcional - manter comentado se quiser preservar)
    // localStorage.removeItem('rsvps');
    
    // Limpar qualquer outro dado de teste
    localStorage.removeItem('sampleDataInitialized');
    
    console.log('🧹 Dados de teste removidos! Base limpa para uso real.');
    console.log('📝 RSVPs preservados (se existirem).');
    
    // Recarregar a página para aplicar as mudanças
    window.location.reload();
  }
}

export function clearEverything() {
  if (typeof window !== 'undefined') {
    // Limpar TUDO (incluindo RSVPs)
    localStorage.removeItem('adminGifts');
    localStorage.removeItem('rsvps');
    localStorage.removeItem('sampleDataInitialized');
    
    console.log('🗑️ TODOS os dados removidos! Base completamente limpa.');
    
    // Recarregar a página para aplicar as mudanças
    window.location.reload();
  }
}

// Função para verificar se há dados de teste
export function hasTestData() {
  if (typeof window === 'undefined') return false;
  
  const adminGifts = localStorage.getItem('adminGifts');
  const sampleFlag = localStorage.getItem('sampleDataInitialized');
  
  return !!(adminGifts || sampleFlag);
}

// Função para obter estatísticas dos dados atuais
export function getDataStats() {
  if (typeof window === 'undefined') return null;
  
  const adminGifts = localStorage.getItem('adminGifts');
  const rsvps = localStorage.getItem('rsvps');
  
  const giftsCount = adminGifts ? JSON.parse(adminGifts).length : 0;
  const rsvpsCount = rsvps ? JSON.parse(rsvps).length : 0;
  
  return {
    gifts: giftsCount,
    rsvps: rsvpsCount,
    hasData: giftsCount > 0 || rsvpsCount > 0
  };
}