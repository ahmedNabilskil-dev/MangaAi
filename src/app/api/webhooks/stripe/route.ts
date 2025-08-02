// src/app/api/webhooks/stripe/route.ts
// src/app/api/webhooks/stripe/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: "Stripe webhook is not configured" },
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

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    const body = await request.text();
    const signature = request.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
          supabase
        );
        break;
      case "checkout.session.async_payment_succeeded":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
          supabase
        );
        break;
      case "checkout.session.async_payment_failed":
        await handlePaymentFailed(
          event.data.object as Stripe.Checkout.Session,
          supabase
        );
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  supabase: any
) {
  const { userId, credits } = session.metadata!;

  // Update payment session status
  await supabase
    .from("payment_sessions")
    .update({ status: "completed" })
    .eq("stripe_session_id", session.id);

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
    return;
  }

  // Update user credits
  const newCredits = (user.credits || 0) + creditAmount;
  await supabase.from("users").update({ credits: newCredits }).eq("id", userId);

  // Record credit transaction
  await supabase.from("credit_transactions").insert({
    user_id: userId,
    type: "purchase",
    amount: creditAmount,
    operation: "credit_purchase",
    description: `Credit purchase via Stripe - ${creditAmount} credits`,
    metadata: {
      stripe_session_id: session.id,
      payment_intent_id: session.payment_intent,
      amount_paid: session.amount_total,
    },
  });

  console.log(`Successfully added ${creditAmount} credits to user ${userId}`);
}

async function handlePaymentFailed(
  session: Stripe.Checkout.Session,
  supabase: any
) {
  // Update payment session status
  await supabase
    .from("payment_sessions")
    .update({ status: "failed" })
    .eq("stripe_session_id", session.id);

  console.log(`Payment failed for session ${session.id}`);
}
