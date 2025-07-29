import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const { userId } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }
  // Supabase Admin client (서비스 키 필요)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
  // 1. Auth user 삭제
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
    userId
  );
  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }
  // 2. users 테이블 row 삭제
  const { error: userError } = await supabaseAdmin
    .from("users")
    .delete()
    .eq("id", userId);
  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }
  // 3. profile 스토리지 이미지 삭제
  const { data: files, error: listError } = await supabaseAdmin.storage
    .from("profile")
    .list("", { search: `profile-${userId}` });
  if (listError) {
    return NextResponse.json({ error: listError.message }, { status: 500 });
  }
  if (files && files.length > 0) {
    const fileNames = files.map((f) => f.name);
    const { error: removeError } = await supabaseAdmin.storage
      .from("profile")
      .remove(fileNames);
    if (removeError) {
      return NextResponse.json({ error: removeError.message }, { status: 500 });
    }
  }
  return NextResponse.json({ success: true });
}
