"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createManualAppointment(tenantId: string, data: {
  serviceId: string,
  professionalId?: string,
  clientName: string,
  clientPhone?: string,
  appointmentDate: string,
  appointmentTime: string,
  status?: string
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('appointments')
    .insert([
      {
        tenant_id: tenantId,
        service_id: data.serviceId,
        professional_id: data.professionalId || null,
        client_name: data.clientName,
        client_phone: data.clientPhone || null,
        appointment_date: data.appointmentDate,
        appointment_time: data.appointmentTime,
        status: data.status || 'WAITING'
      }
    ]);

  if (error) {
    console.error("Erro ao criar comanda manual:", error);
    return { error: error.message };
  }

  revalidatePath('/admin/comandas');
  revalidatePath('/admin/agenda');
  return { success: true };
}
