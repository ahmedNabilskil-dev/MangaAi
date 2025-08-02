import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Check if basic tables exist
    const checks = {
      users: false,
      manga_projects: false,
      chat_messages: false,
      supabase_connection: false,
    };

    // Test Supabase connection
    try {
      const { data, error } = await supabase
        .from("manga_projects")
        .select("count", { count: "exact", head: true });

      if (!error) {
        checks.supabase_connection = true;
        checks.manga_projects = true;
      }
    } catch (error) {
      console.error("Manga projects check failed:", error);
    }

    // Check users table
    try {
      const { data, error } = await supabase
        .from("users")
        .select("count", { count: "exact", head: true });

      if (!error) {
        checks.users = true;
      }
    } catch (error) {
      console.error("Users table check failed:", error);
    }

    // Check chat_messages table
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("count", { count: "exact", head: true });

      if (!error) {
        checks.chat_messages = true;
      }
    } catch (error) {
      console.error("Chat messages table check failed:", error);
    }

    const allChecksPass = Object.values(checks).every(Boolean);

    return NextResponse.json({
      status: allChecksPass ? "healthy" : "issues_detected",
      checks,
      environment: {
        supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓" : "✗",
        service_role_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✓" : "✗",
        anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓" : "✗",
        gemini_api_key: process.env.GEMINI_API_KEY ? "✓" : "✗",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Database health check error:", error);
    return NextResponse.json(
      {
        status: "error",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
