// src/app/api/debug-user/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId parameter required" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Check auth user
    const { data: authUser, error: authError } =
      await supabase.auth.admin.getUserById(userId);

    // Check database user
    const { data: dbUser, error: dbError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    // Check if users table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from("users")
      .select("count(*)")
      .limit(1);

    return NextResponse.json({
      userId,
      authUser: authUser.user
        ? {
            id: authUser.user.id,
            email: authUser.user.email,
            created_at: authUser.user.created_at,
            user_metadata: authUser.user.user_metadata,
            app_metadata: authUser.user.app_metadata,
          }
        : null,
      authError: authError?.message,
      dbUser: dbUser,
      dbError: dbError?.message,
      tableExists: !tableError,
      tableError: tableError?.message,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
