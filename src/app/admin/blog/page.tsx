import { createClient } from "@/lib/supabase/server";
import BlogManagement from "./_components/BlogManagement";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .order("published_at", { ascending: false });

  return (
    <div className="space-y-8 h-full">
      <BlogManagement initialPosts={posts || []} />
    </div>
  );
}
