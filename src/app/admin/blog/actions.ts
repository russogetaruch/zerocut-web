"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function savePost(postData: {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  cover_url?: string;
  author_name?: string;
  published_at?: string;
}) {
  const supabase = await createClient();

  const slug = generateSlug(postData.title);

  let result;

  if (postData.id) {
    result = await supabase
      .from("posts")
      .update({
        title: postData.title,
        slug,
        excerpt: postData.excerpt,
        content: postData.content,
        cover_url: postData.cover_url || null,
        author_name: postData.author_name || "Equipe ZERØCUT",
        published_at: postData.published_at || new Date().toISOString(),
      })
      .eq("id", postData.id);
  } else {
    result = await supabase.from("posts").insert([
      {
        title: postData.title,
        slug,
        excerpt: postData.excerpt,
        content: postData.content,
        cover_url: postData.cover_url || null,
        author_name: postData.author_name || "Equipe ZERØCUT",
        published_at: postData.published_at || new Date().toISOString(),
      },
    ]);
  }

  if (result.error) {
    return { error: result.error.message };
  }

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath("/blog/[slug]", "page");

  return { success: true };
}

export async function deletePost(postId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("posts").delete().eq("id", postId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/blog");
  revalidatePath("/blog");

  return { success: true };
}
