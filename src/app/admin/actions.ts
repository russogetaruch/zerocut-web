"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateAppointmentStatus(appointmentId: string, status: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", appointmentId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin");
  return { success: true };
}
