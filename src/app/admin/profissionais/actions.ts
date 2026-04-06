"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveProfessional(tenantId: string, profData: { id?: string, name: string, specialty: string, avatarUrl: string }) {
  const supabase = await createClient();

  let result;
  
  if (profData.id) {
    // Update
    result = await supabase
      .from('professionals')
      .update({
        name: profData.name,
        specialty: profData.specialty,
        avatar_url: profData.avatarUrl
      })
      .eq('id', profData.id);
  } else {
    // Insert
    result = await supabase
      .from('professionals')
      .insert([
        {
          tenant_id: tenantId,
          name: profData.name,
          specialty: profData.specialty,
          avatar_url: profData.avatarUrl
        }
      ]);
  }

  if (result.error) {
    return { error: result.error.message };
  }

  revalidatePath('/admin/profissionais');
  revalidatePath('/b/[slug]', 'page');
  
  return { success: true };
}

export async function deleteProfessional(profId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('professionals')
    .delete()
    .eq('id', profId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/profissionais');
  revalidatePath('/b/[slug]', 'page');
  
  return { success: true };
}
