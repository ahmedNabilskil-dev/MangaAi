// src/app/api/debug-user-subscription/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get user details
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError) {
      return NextResponse.json(
        { error: "User not found", details: userError },
        { status: 404 }
      );
    }

    // Get recent payment sessions
    const { data: payments, error: paymentsError } = await supabase
      .from("payment_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    // Get recent transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from("credit_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    return NextResponse.json({
      user,
      recentPayments: payments || [],
      recentTransactions: transactions || [],
      paymentsError,
      transactionsError,
    });
  } catch (error: any) {
    console.error("Error debugging user:", error);
    return NextResponse.json(
      { error: "Failed to debug user", details: error.message },
      { status: 500 }
    );
  }
}
