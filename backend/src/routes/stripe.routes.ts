import { Request, Response, Router } from "express";
import Stripe from "stripe";
import { config } from "../config/config";
import { databaseService } from "../services/database";
import { logger } from "../utils/logger";

const router = Router();
const stripe = new Stripe(config.stripeSecretKey);

// Stripe webhook handler
router.post("/stripe", async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      config.stripeWebhookSecret
    );
  } catch (err: any) {
    logger.error("Webhook signature verification failed:", {
      error: err.message,
    });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;
      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        logger.info("Unhandled webhook event type:", { type: event.type });
    }

    res.json({ received: true });
  } catch (error: any) {
    logger.error("Webhook processing error:", { error, eventType: event.type });
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  try {
    const { userId, credits } = session.metadata || {};

    if (!userId || !credits) {
      logger.error("Missing metadata in checkout session:", {
        sessionId: session.id,
      });
      return;
    }

    // Find the payment session
    const paymentSession = await databaseService.getPaymentSessionByStripeId(
      session.id
    );
    if (!paymentSession) {
      logger.error("Payment session not found:", {
        stripeSessionId: session.id,
      });
      return;
    }

    if (paymentSession.status === "completed") {
      logger.info("Payment session already processed:", {
        sessionId: session.id,
      });
      return;
    }

    // Add credits to user account
    const creditAmount = parseInt(credits);
    await databaseService.addCredits(
      userId,
      creditAmount,
      "purchase",
      `Credit purchase via Stripe - ${creditAmount} credits`,
      {
        stripe_session_id: session.id,
        payment_intent_id: session.payment_intent,
        amount_paid: session.amount_total,
      }
    );

    // Update payment session status
    await databaseService.updatePaymentSession(paymentSession.id, {
      status: "completed",
    });

    logger.info("Checkout completed successfully:", {
      userId,
      credits: creditAmount,
      sessionId: session.id,
    });
  } catch (error) {
    logger.error("Error handling checkout completion:", {
      error,
      sessionId: session.id,
    });
    throw error;
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  try {
    logger.info("Payment succeeded:", { invoiceId: invoice.id });
    // Handle subscription payments if needed
  } catch (error) {
    logger.error("Error handling payment success:", {
      error,
      invoiceId: invoice.id,
    });
    throw error;
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  try {
    logger.warn("Payment failed:", { invoiceId: invoice.id });
    // Handle failed payments
  } catch (error) {
    logger.error("Error handling payment failure:", {
      error,
      invoiceId: invoice.id,
    });
    throw error;
  }
}

export default router;
