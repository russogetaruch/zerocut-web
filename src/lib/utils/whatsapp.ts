/**
 * Utilitário para geração de links dinâmicos do WhatsApp
 */
export function generateWhatsAppLink(phone: string, message: string) {
  // Limpa o número (remove tudo que não for dígito)
  const cleanPhone = phone.replace(/\D/g, "");
  
  // Garante o código do país se não houver (assumindo Brasil para este MVP)
  const finalPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
  
  // Codifica a mensagem para URL
  const encodedMessage = encodeURIComponent(message);
  
  return `https://wa.me/${finalPhone}?text=${encodedMessage}`;
}

export const CRM_MESSAGES = {
  REMINDER: (name: string, barber: string) => 
    `Olá ${name}! Passando para confirmar seu agendamento com ${barber} na ZERØCUT. Estamos te esperando! ✂️`,
    
  RECOVERY: (name: string) => 
    `Olá ${name}! Notamos que faz tempo que você não nos visita... Que tal dar aquele trato no visual essa semana? Temos horários disponíveis! 💈`,
    
  VIP: (name: string) => 
    `Parabéns ${name}! Você acaba de atingir o nível VIP na ZERØCUT. No seu próximo corte você tem um brinde especial! 🏆`
};
