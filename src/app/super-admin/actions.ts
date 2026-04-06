"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleTenantStatus(tenantId: string, currentStatus: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('tenants')
    .update({ is_active: !currentStatus })
    .eq('id', tenantId);

  if (error) {
    console.error("Erro ao alterar status do tenant:", error);
    return { error: error.message };
  }

  revalidatePath('/super-admin');
  return { success: true };
}

export async function createTenant(data: { name: string, slug: string, owner_id?: string }) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('tenants')
    .insert([{
      name: data.name,
      slug: data.slug,
      owner_id: data.owner_id || null
    }]);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/super-admin');
  return { success: true };
}
