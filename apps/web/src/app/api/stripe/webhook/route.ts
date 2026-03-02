import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { db, workspaces, subscriptions, eq } from "@testimonialkit/db";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const workspaceId = session.metadata?.workspaceId;
        if (!workspaceId || !session.subscription) break;

        const sub = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        const periodEnd = (sub.items.data[0] as any)?.current_period_end;

        await db
          .update(workspaces)
          .set({
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            plan: getPlanFromPriceId(sub.items.data[0]?.price.id),
          })
          .where(eq(workspaces.id, workspaceId));

        await db.insert(subscriptions).values({
          workspaceId,
          stripeSubscriptionId: session.subscription as string,
          stripePriceId: sub.items.data[0]?.price.id || "",
          status: sub.status,
          currentPeriodEnd: periodEnd
            ? new Date(periodEnd * 1000)
            : new Date(),
        });

        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const [workspace] = await db
          .select()
          .from(workspaces)
          .where(eq(workspaces.stripeSubscriptionId, sub.id))
          .limit(1);

        if (!workspace) break;

        const periodEnd = (sub.items.data[0] as any)?.current_period_end;

        await db
          .update(workspaces)
          .set({
            plan: getPlanFromPriceId(sub.items.data[0]?.price.id),
          })
          .where(eq(workspaces.id, workspace.id));

        await db
          .update(subscriptions)
          .set({
            status: sub.status,
            stripePriceId: sub.items.data[0]?.price.id || "",
            currentPeriodEnd: periodEnd
              ? new Date(periodEnd * 1000)
              : new Date(),
          })
          .where(eq(subscriptions.stripeSubscriptionId, sub.id));

        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const [workspace] = await db
          .select()
          .from(workspaces)
          .where(eq(workspaces.stripeSubscriptionId, sub.id))
          .limit(1);

        if (!workspace) break;

        await db
          .update(workspaces)
          .set({ plan: "free", stripeSubscriptionId: null })
          .where(eq(workspaces.id, workspace.id));

        await db
          .update(subscriptions)
          .set({ status: "canceled" })
          .where(eq(subscriptions.stripeSubscriptionId, sub.id));

        break;
      }
    }
  } catch (err) {
    console.error("[webhook] handler error", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

function getPlanFromPriceId(priceId: string | undefined): "free" | "indie" | "pro" {
  if (!priceId) return "free";
  if (priceId === process.env.STRIPE_INDIE_PRICE_ID) return "indie";
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "pro";
  return "free";
}
