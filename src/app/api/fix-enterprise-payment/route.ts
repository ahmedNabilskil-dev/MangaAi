// src/app/api/fix-enterprise-payment/route.ts
import { getCreditPackageById, getTotalCredits } from "@/lib/credit-packages";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { userId, sessionId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get the payment session
    const { data: paymentSession, error: sessionError } = await supabase
      .from("payment_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("stripe_session_id", sessionId)
      .single();

    if (sessionError || !paymentSession) {
      return NextResponse.json(
        { error: "Payment session not found" },
        { status: 404 }
      );
    }

    // Check if this was an "enterprise" subscription that should have been credits
    const metadata = paymentSession.metadata as any;
    if (
      metadata?.type === "subscription" &&
      metadata?.planId === "enterprise"
    ) {
      // This should have been a credit purchase!
      const enterprisePackage = getCreditPackageById("enterprise");

      if (!enterprisePackage) {
        return NextResponse.json(
          { error: "Enterprise package not found" },
          { status: 404 }
        );
      }

      const totalCredits = getTotalCredits(enterprisePackage);

      // Get current user
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("credits, subscription_tier")
        .eq("id", userId)
        .single();

      if (userError || !user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Add the credits that should have been added
      const newCredits = (user.credits || 0) + totalCredits;
      await supabase
        .from("users")
        .update({
          credits: newCredits,
          // Remove subscription if it was incorrectly set
          subscription_tier: "free",
          subscription_expires_at: null,
        })
        .eq("id", userId);

      // Record the correction transaction
      await supabase.from("credit_transactions").insert({
        user_id: userId,
        type: "purchase",
        amount: totalCredits,
        operation: "credit_purchase",
        description: `Enterprise credit package correction - ${totalCredits} credits (${enterprisePackage.credits} + ${enterprisePackage.bonus} bonus)`,
        metadata: {
          correction: true,
          original_session_id: sessionId,
          package_id: "enterprise",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Enterprise payment corrected to credit package",
        creditsAdded: totalCredits,
        newBalance: newCredits,
        packageDetails: enterprisePackage,
      });
    }

    return NextResponse.json({
      error: "No correction needed or session not eligible",
      sessionDetails: paymentSession,
    });
  } catch (error: any) {
    console.error("Error fixing payment:", error);
    return NextResponse.json(
      { error: "Failed to fix payment", details: error.message },
      { status: 500 }
    );
  }
}
