import { getCreditPackageById, getTotalCredits } from "@/lib/credit-packages";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        {
          error:
            "Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables.",
        },
        { status: 500 }
      );
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json(
        {
          error:
            "Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL to your environment variables.",
        },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-07-30.basil",
    });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        ""
    );

    const { userId, type, packageId, planId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Try to get user from public.users first
    let { data: user, error: userError } = await supabase
      .from("users")
      .select("email, name")
      .eq("id", userId)
      .single();

    // If user not found in public.users, try to get from auth.users and create profile
    if (userError && userError.code === "PGRST116") {
      console.log(
        "User not found in public.users, attempting to create profile..."
      );

      // Only attempt auth operations if we have service role key
      if (
        !process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_SERVICE_ROLE_KEY === "your-service-role-key-here"
      ) {
        console.log(
          "No service role key available, user profile must be created first"
        );
        return NextResponse.json(
          {
            error:
              "User profile not found. Please complete your profile setup first.",
          },
          { status: 404 }
        );
      }

      // Get user from auth system using service role
      const { data: authUser, error: authError } =
        await supabase.auth.admin.getUserById(userId);

      if (authError || !authUser.user) {
        console.log("User not found in auth system:", authError);
        return NextResponse.json(
          { error: "User not found. Please sign in again." },
          { status: 404 }
        );
      }

      // Create user profile
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert({
          id: userId,
          email: authUser.user.email || "",
          name:
            authUser.user.user_metadata?.name ||
            authUser.user.email?.split("@")[0] ||
            "User",
          avatar_url: authUser.user.user_metadata?.avatar_url || null,
          provider: authUser.user.app_metadata?.provider || "email",
        })
        .select("email, name")
        .single();

      if (createError) {
        console.error("Error creating user profile:", createError);
        return NextResponse.json(
          { error: "Failed to create user profile" },
          { status: 500 }
        );
      }

      user = newUser;
      console.log("User profile created successfully");
    } else if (userError) {
      console.log("Database error:", userError);
      return NextResponse.json(
        { error: "Database error. Please try again." },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "User data not available" },
        { status: 404 }
      );
    }

    let sessionParams: Stripe.Checkout.SessionCreateParams;

    // Only handle credit purchases now
    if (type === "credits") {
      // Credit purchase - use centralized packages
      const packageData = getCreditPackageById(packageId);
      if (!packageData) {
        return NextResponse.json({ error: "Invalid package" }, { status: 400 });
      }

      const totalCredits = getTotalCredits(packageData);

      sessionParams = {
        payment_method_types: ["card"],
        customer_email: user.email as string,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: packageData.name,
                description: `${packageData.credits} credits + ${packageData.bonus} bonus credits`,
                images: [`${process.env.NEXT_PUBLIC_APP_URL}/images/manga.png`],
              },
              unit_amount: Math.round(packageData.price * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancelled`,
        metadata: {
          userId,
          type: "credits",
          packageId,
          credits: totalCredits.toString(),
        },
      };
    } else {
      return NextResponse.json(
        { error: "Only credit purchases are supported" },
        { status: 400 }
      );
    }

    // Create payment session in database
    const { data: paymentSession, error: sessionError } = await supabase
      .from("payment_sessions")
      .insert({
        user_id: userId,
        type: "credits",
        status: "pending",
        amount: sessionParams.line_items![0].price_data!.unit_amount!,
        credits_amount: parseInt(sessionParams.metadata!.credits as string),
        metadata: sessionParams.metadata,
      })
      .select()
      .single();

    if (sessionError) {
      console.error("Error creating payment session:", sessionError);
      console.error("Error creating payment session:", sessionError);
      return NextResponse.json(
        { error: "Failed to create payment session" },
        { status: 500 }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      ...sessionParams,
      metadata: {
        ...sessionParams.metadata,
        paymentSessionId: paymentSession.id,
      },
    });

    // Update payment session with Stripe session ID
    await supabase
      .from("payment_sessions")
      .update({ stripe_session_id: session.id })
      .eq("id", paymentSession.id);

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
