"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateWorkingHours(tenantId: string, hours: any[]) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('working_hours')
    .upsert(hours.map(h => ({
      tenant_id: tenantId,
      day_of_week: h.day_of_week,
      open_time: h.open_time,
      close_time: h.close_time,
      is_closed: h.is_closed
    })));

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/horarios');
  revalidatePath('/b/[slug]', 'page');
  return { success: true };
}
