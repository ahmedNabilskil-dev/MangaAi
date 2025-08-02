// src/app/api/deduct-credits/route.ts
import {
  formatOperationType,
  getCreditCost,
  type OperationType,
} from "@/backend/lib/credit-manager";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const {
      userId,
      operation,
      count = 1,
      description,
      // Dynamic parameters
      tokens,
      characters,
      width,
      height,
      quality = "standard",
    } = await request.json();

    if (!userId || !operation) {
      return NextResponse.json(
        { error: "User ID and operation are required" },
        { status: 400 }
      );
    }

    // Validate operation type
    const validOperations: OperationType[] = [
      "textGeneration",
      "imageGeneration",
    ];

    if (!validOperations.includes(operation)) {
      return NextResponse.json(
        { error: "Invalid operation type" },
        { status: 400 }
      );
    }

    // Calculate dynamic cost based on operation parameters
    const params = {
      tokens,
      characters,
      width,
      height,
      quality,
    };

    const creditsNeeded = getCreditCost(operation, params) * count;

    // Get current user credits
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("credits")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has enough credits
    if (user.credits < creditsNeeded) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          required: creditsNeeded,
          available: user.credits,
          shortfall: creditsNeeded - user.credits,
        },
        { status: 402 } // Payment Required
      );
    }

    // Deduct credits
    const newCredits = user.credits - creditsNeeded;
    const { error: updateError } = await supabase
      .from("users")
      .update({ credits: newCredits })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating user credits:", updateError);
      return NextResponse.json(
        { error: "Failed to deduct credits" },
        { status: 500 }
      );
    }

    // Record the transaction
    const { error: transactionError } = await supabase
      .from("credit_transactions")
      .insert({
        user_id: userId,
        type: "generation",
        amount: -creditsNeeded, // Negative for deduction
        operation:
          operation === "textGeneration"
            ? "text_generation"
            : operation === "imageGeneration"
            ? "image_generation"
            : "text_generation", // Default fallback
        description:
          description || `${formatOperationType(operation)} (${count}x)`,
        cost_tokens: creditsNeeded,
        metadata: {
          operation_type: operation,
          operation_count: count,
          credits_per_operation: getCreditCost(operation, params),
          // Include dynamic parameters for audit trail
          ...(tokens && { tokens }),
          ...(characters && { characters }),
          ...(width && { width }),
          ...(height && { height }),
          ...(quality && { quality }),
        },
      });

    if (transactionError) {
      console.error("Error recording transaction:", transactionError);
      // Don't fail the request if transaction recording fails
    }

    return NextResponse.json({
      success: true,
      creditsDeducted: creditsNeeded,
      remainingCredits: newCredits,
      operation: formatOperationType(operation),
      count,
    });
  } catch (error: any) {
    console.error("Error deducting credits:", error);
    return NextResponse.json(
      { error: "Failed to deduct credits", details: error.message },
      { status: 500 }
    );
  }
}
