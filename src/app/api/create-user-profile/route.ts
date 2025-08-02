// src/app/api/create-user-profile/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json(
        { error: "Supabase is not configured" },
        { status: 500 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        ""
    );

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    if (existingUser) {
      return NextResponse.json({ message: "User profile already exists" });
    }

    // Get user from auth
    const { data: authUser, error: authError } =
      await supabase.auth.admin.getUserById(userId);

    if (authError || !authUser.user) {
      return NextResponse.json(
        { error: "User not found in auth system" },
        { status: 404 }
      );
    }

    // Create user profile
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({
        id: userId,
        email: authUser.user.email!,
        name:
          authUser.user.user_metadata?.name ||
          authUser.user.user_metadata?.full_name ||
          null,
        avatar_url: authUser.user.user_metadata?.avatar_url || null,
        provider: authUser.user.app_metadata?.provider || "email",
        credits: 10, // Initial credits
        daily_credits_used: 0,
        last_daily_reset: new Date().toISOString(),
        subscription_tier: "free",
        subscription_expires_at: null,
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating user profile:", createError);
      return NextResponse.json(
        { error: "Failed to create user profile" },
        { status: 500 }
      );
    }

    // Add initial credit transaction
    await supabase.from("credit_transactions").insert({
      user_id: userId,
      type: "daily_bonus",
      amount: 10,
      operation: "daily_renewal",
      description: "Welcome bonus - initial free credits",
      metadata: { welcome_bonus: true },
    });

    return NextResponse.json({
      message: "User profile created successfully",
      user: newUser,
    });
  } catch (error: any) {
    console.error("Error in create user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
