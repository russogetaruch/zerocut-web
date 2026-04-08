"use server";

import { createClient } from "@/lib/supabase/server";

export async function createBooking(tenantId: string, bookingData: { serviceId: string, serviceName: string, professionalId: string, date: string, time: string, clientName: string, clientPhone: string }) {
  const supabase = await createClient();

  // Insira o agendamento no Supabase vinculado ao profissional
  const { error } = await supabase.from("appointments").insert([
    {
      tenant_id: tenantId,
      service_id: bookingData.serviceId,
      professional_id: bookingData.professionalId,
      client_name: bookingData.clientName,
      client_phone: bookingData.clientPhone, 
      appointment_date: bookingData.date,
      appointment_time: `${bookingData.time}:00`,
      status: "INCOMING",
    }
  ]);

  if (error) {
    // Código 23505: Unique Violation (Double Booking)
    if (error.code === '23505') {
       return { error: "Este horário já foi ocupado enquanto você preenchia. Por favor, escolha outro!" };
    }
    return { error: error.message };
  }

  return { success: true };
}
