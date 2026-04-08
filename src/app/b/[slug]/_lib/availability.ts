"use server";

import { createClient } from "@/lib/supabase/server";
import { addMinutes, format, parse, isAfter, startOfToday } from "date-fns";

export async function getAvailableSlots(tenantId: string, professionalId: string, date: string) {
  const supabase = await createClient();

  // 1. Buscar horário de funcionamento do dia
  const dayOfWeek = new Date(date).getDay();
  let { data: workingHours } = await supabase
    .from('working_hours')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('day_of_week', dayOfWeek)
    .single();

  // FALLBACK: open_time e close_time são os nomes corretos do schema
  if (!workingHours) {
    workingHours = {
       open_time: '09:00:00',
       close_time: '19:00:00',
       is_closed: false
    };
  }

  if (workingHours.is_closed) {
    return [];
  }

  // 2. Buscar agendamentos existentes
  const { data: existingAppointments } = await supabase
    .from('appointments')
    .select('appointment_time')
    .eq('tenant_id', tenantId)
    .eq('professional_id', professionalId)
    .eq('appointment_date', date)
    .neq('status', 'CANCELED');

  const occupiedSlots = existingAppointments?.map(a => a.appointment_time.substring(0, 5)) || [];

  // 3. Gerar slots baseados no funcionamento (Intervalo de 45 min padrão)
  const slots: string[] = [];
  
  // Usamos h:mm:ss para garantir o parse correto do banco
  let current = parse(workingHours.open_time, workingHours.open_time.includes(':') && workingHours.open_time.split(':').length === 3 ? 'HH:mm:ss' : 'HH:mm', new Date());
  const end = parse(workingHours.close_time, workingHours.close_time.includes(':') && workingHours.close_time.split(':').length === 3 ? 'HH:mm:ss' : 'HH:mm', new Date());

  const today = format(new Date(), 'yyyy-MM-dd');
  const now = new Date();

  while (current < end) {
    const timeStr = format(current, 'HH:mm');
    
    // Regra: Não está ocupado E (Se for hoje, o horário já não passou)
    const isOccupied = occupiedSlots.includes(timeStr);
    
    // Comparação de tempo mais segura para o mesmo dia
    const slotDateTime = parse(timeStr, 'HH:mm', new Date());
    const isPast = date === today && isAfter(now, slotDateTime);

    if (!isOccupied && !isPast) {
      slots.push(timeStr);
    }
    
    current = addMinutes(current, 45); // Duração padrão do ZEROCUT
  }

  return slots;
}
