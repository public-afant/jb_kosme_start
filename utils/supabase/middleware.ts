import { createServerClient } from "@supabase/ssr";
import { NextRequest } from "next/server";

export async function checkAuth(request: NextRequest) {
  // console.log("checkAuth!");
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {},
      },
    }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // console.log("user", user);
  return user;
}
