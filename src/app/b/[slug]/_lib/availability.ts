"use server";

import { createClient } from "@/lib/supabase/server";
import { addMinutes, format, parse, isAfter, startOfToday } from "date-fns";

export async function getAvailableSlots(tenantId: string, professionalId: string, date: string) {
  const supabase = await createClient();

  // 1. Buscar horário de funcionamento do dia
  const dayOfWeek = new Date(date).getDay();
  const { data: workingHours } = await supabase
    .from('working_hours')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('day_of_week', dayOfWeek)
    .single();

  if (!workingHours || workingHours.is_closed) {
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
  let current = parse(workingHours.opening_time, 'HH:mm:ss', new Date());
  const end = parse(workingHours.closing_time, 'HH:mm:ss', new Date());

  const today = format(new Date(), 'yyyy-MM-dd');
  const now = new Date();

  while (current < end) {
    const timeStr = format(current, 'HH:mm');
    
    // Regra: Não está ocupado E (Se for hoje, o horário já não passou)
    const isOccupied = occupiedSlots.includes(timeStr);
    const isPast = date === today && current < now;

    if (!isOccupied && !isPast) {
      slots.push(timeStr);
    }
    
    current = addMinutes(current, 45); // Duração padrão do ZEROCUT
  }

  return slots;
}
