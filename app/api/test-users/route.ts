import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileParam = searchParams.get("file") || "user-3"; // default

    // 안전한 파일명만 허용
    const allowed = new Set(["user", "user-2", "user-3"]);
    if (!allowed.has(fileParam)) {
      return NextResponse.json(
        { error: "Invalid file parameter" },
        { status: 400 }
      );
    }

    const projectRoot = process.cwd();
    const targetPath = path.join(
      projectRoot,
      "app",
      "test",
      `${fileParam}.json`
    );

    const content = await fs.readFile(targetPath, "utf-8");
    // 검증: JSON 파싱 가능 여부 체크
    const data = JSON.parse(content);
    return NextResponse.json(data);
  } catch (error) {
    console.error("/api/test-users GET error:", error);
    return NextResponse.json(
      { error: "Failed to load test users" },
      { status: 500 }
    );
  }
}
