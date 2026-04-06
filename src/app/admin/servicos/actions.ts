"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveService(tenantId: string, serviceData: { id?: string, name: string, price: number, duration: number }) {
  const supabase = await createClient();

  let result;
  
  if (serviceData.id) {
    // Update
    result = await supabase
      .from('services')
      .update({
        name: serviceData.name,
        price: serviceData.price,
        duration_minutes: serviceData.duration
      })
      .eq('id', serviceData.id);
  } else {
    // Insert
    result = await supabase
      .from('services')
      .insert([
        {
          tenant_id: tenantId,
          name: serviceData.name,
          price: serviceData.price,
          duration_minutes: serviceData.duration
        }
      ]);
  }

  if (result.error) {
    return { error: result.error.message };
  }

  // Limpa o cache para as páginas afetadas
  revalidatePath('/admin/servicos');
  revalidatePath('/b/[slug]', 'page');
  
  return { success: true };
}

export async function deleteService(serviceId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', serviceId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/servicos');
  revalidatePath('/b/[slug]', 'page');
  
  return { success: true };
}
