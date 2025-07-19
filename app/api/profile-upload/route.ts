import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json(
        { error: "No user ID provided" },
        { status: 400 }
      );
    }

    // 서비스 롤 키를 사용한 Supabase 클라이언트 생성
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
    );

    // 파일 확장자 추출
    const fileExt = file.name.split(".").pop();
    const fileName = `profile-${userId}.${fileExt}`;

    // 기존 파일 삭제 (다른 확장자일 수 있으므로 패턴으로 검색)
    const { data: existingFiles } = await supabaseAdmin.storage
      .from("profile")
      .list("", {
        search: `profile-${userId}`,
      });

    if (existingFiles && existingFiles.length > 0) {
      // 기존 파일들 삭제
      const filesToDelete = existingFiles.map((file) => file.name);
      await supabaseAdmin.storage.from("profile").remove(filesToDelete);
    }

    // 새 파일 업로드
    const { error: uploadError } = await supabaseAdmin.storage
      .from("profile")
      .upload(fileName, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    // 공개 URL 생성
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("profile").getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "No user ID provided" },
        { status: 400 }
      );
    }

    // 서비스 롤 키를 사용한 Supabase 클라이언트 생성
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
    );

    // 기존 파일 삭제 (다른 확장자일 수 있으므로 패턴으로 검색)
    const { data: existingFiles } = await supabaseAdmin.storage
      .from("profile")
      .list("", {
        search: `profile-${userId}`,
      });

    if (existingFiles && existingFiles.length > 0) {
      // 기존 파일들 삭제
      const filesToDelete = existingFiles.map((file) => file.name);
      await supabaseAdmin.storage.from("profile").remove(filesToDelete);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
