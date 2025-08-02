// src/app/api/credits/balance/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get auth header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    // Verify the token and get user
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("users")
      .select("credits, daily_credits_used, last_daily_reset")
      .eq("id", authUser.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Check if daily credits should be reset
    await checkAndResetDailyCredits(authUser.id);

    return NextResponse.json({
      credits: data.credits,
      daily_credits_used: data.daily_credits_used,
    });
  } catch (error: any) {
    console.error("Get credits error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function checkAndResetDailyCredits(userId: string): Promise<void> {
  const { data, error } = await supabase
    .from("users")
    .select("last_daily_reset, daily_credits_used")
    .eq("id", userId)
    .single();

  if (error || !data) return;

  const lastReset = new Date(data.last_daily_reset);
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;

  // Check if 24 hours have passed since last reset
  if (now.getTime() - lastReset.getTime() >= oneDay) {
    await resetDailyCredits(userId);
  }
}

async function resetDailyCredits(userId: string): Promise<void> {
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("users")
    .update({
      daily_credits_used: 0,
      last_daily_reset: now,
    })
    .eq("id", userId);

  if (error) throw error;

  // Grant daily free credits
  await grantDailyCredits(userId);
}

async function grantDailyCredits(userId: string): Promise<void> {
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("credits")
    .eq("id", userId)
    .single();

  if (userError || !user) return;

  // For now, give everyone 10 daily free credits
  const dailyFreeCredits = 10;

  // Add daily credits
  const newCredits = user.credits + dailyFreeCredits;

  const { error: updateError } = await supabase
    .from("users")
    .update({ credits: newCredits })
    .eq("id", userId);

  if (updateError) throw updateError;

  // Record transaction
  await supabase.from("credit_transactions").insert({
    user_id: userId,
    type: "daily_bonus",
    amount: dailyFreeCredits,
    operation: "daily_renewal",
    cost_tokens: null,
    description: "Daily free credits",
    metadata: { model_used: "free" },
  });
}
