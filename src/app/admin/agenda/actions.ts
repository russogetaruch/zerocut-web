"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateAppointmentStatus(appointmentId: string, status: 'COMPLETED' | 'CANCELED' | 'SCHEDULED') {
  const supabase = await createClient();

  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', appointmentId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/agenda');
  return { success: true };
}

export async function createAdminBooking(data: {
  tenantId: string,
  serviceId: string,
  professionalId: string,
  clientName: string,
  appointmentDate: string,
  appointmentTime: string
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('appointments')
    .insert([{
      tenant_id: data.tenantId,
      service_id: data.serviceId,
      professional_id: data.professionalId,
      client_name: data.clientName,
      appointment_date: data.appointmentDate,
      appointment_time: data.appointmentTime,
      status: 'SCHEDULED'
    }]);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/agenda');
  return { success: true };
}

export async function updateTenant(tenantId: string, data: { 
  name: string, 
  address: string, 
  logo_url: string,
  tagline?: string,
  description?: string,
  banner_url?: string
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('tenants')
    .update({
      name: data.name,
      address: data.address,
      logo_url: data.logo_url,
      tagline: data.tagline,
      description: data.description,
      banner_url: data.banner_url
    })
    .eq('id', tenantId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/configuracoes');
  revalidatePath('/admin/vitrine');
  revalidatePath('/admin');
  revalidatePath('/b/[slug]', 'layout'); // Invalida a vitrine pública
  return { success: true };
}
