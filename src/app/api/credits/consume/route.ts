// src/app/api/credits/consume/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
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

    const { amount, operation, description, metadata } = await request.json();

    if (!amount || !operation || !description) {
      return NextResponse.json(
        { error: "Amount, operation, and description are required" },
        { status: 400 }
      );
    }

    // Check if user has enough credits
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("credits, daily_credits_used")
      .eq("id", authUser.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (userData.credits < amount) {
      return NextResponse.json({
        success: false,
        remaining_credits: userData.credits,
        error: "Insufficient credits",
      });
    }

    // Deduct credits
    const newCredits = userData.credits - amount;
    const newDailyUsed = userData.daily_credits_used + amount;

    const { error: updateError } = await supabase
      .from("users")
      .update({
        credits: newCredits,
        daily_credits_used: newDailyUsed,
      })
      .eq("id", authUser.id);

    if (updateError) {
      return NextResponse.json({
        success: false,
        remaining_credits: userData.credits,
        error: updateError.message,
      });
    }

    // Record transaction
    await supabase.from("credit_transactions").insert({
      user_id: authUser.id,
      type: "generation",
      amount: -amount,
      operation,
      cost_tokens: metadata?.cost_tokens || null,
      description,
      metadata: metadata || {},
    });

    return NextResponse.json({
      success: true,
      remaining_credits: newCredits,
    });
  } catch (error: any) {
    console.error("Consume credits error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
