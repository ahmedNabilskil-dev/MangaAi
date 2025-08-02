// src/app/api/payments/create-session/route.ts
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

    const { amount, creditsAmount } = await request.json();

    if (!amount || !creditsAmount) {
      return NextResponse.json(
        { error: "Amount and credits amount are required" },
        { status: 400 }
      );
    }

    const sessionData = {
      user_id: authUser.id,
      type: "credits",
      status: "pending",
      amount,
      credits_amount: creditsAmount,
      stripe_session_id: null,
      metadata: {},
    };

    const { data, error } = await supabase
      .from("payment_sessions")
      .insert(sessionData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ session: data });
  } catch (error: any) {
    console.error("Create payment session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
