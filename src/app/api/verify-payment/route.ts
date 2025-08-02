// src/app/api/verify-payment/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-07-30.basil",
    });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Get Stripe session details
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    // Check if already processed
    const { data: existingSession } = await supabase
      .from("payment_sessions")
      .select("status")
      .eq("stripe_session_id", sessionId)
      .single();

    if (existingSession?.status === "completed") {
      return NextResponse.json({
        message: "Payment already processed",
        alreadyProcessed: true,
      });
    }

    // Process the payment - only credits now
    const { userId, credits } = session.metadata!;

    // Update payment session status
    await supabase
      .from("payment_sessions")
      .update({ status: "completed" })
      .eq("stripe_session_id", sessionId);

    let result: any = { processed: true };

    // Add credits to user account
    const creditAmount = parseInt(credits!);

    // Get current user credits
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("credits")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("Error fetching user:", userError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user credits
    const newCredits = (user.credits || 0) + creditAmount;
    await supabase
      .from("users")
      .update({ credits: newCredits })
      .eq("id", userId);

    // Record credit transaction
    await supabase.from("credit_transactions").insert({
      user_id: userId,
      type: "purchase",
      amount: creditAmount,
      operation: "credit_purchase",
      description: `Credit purchase via Stripe - ${creditAmount} credits`,
      metadata: {
        stripe_session_id: sessionId,
        payment_intent_id: session.payment_intent,
        amount_paid: session.amount_total,
      },
    });

    result.type = "credits";
    result.creditsAdded = creditAmount;
    result.newBalance = newCredits;

    console.log(`Successfully added ${creditAmount} credits to user ${userId}`);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
