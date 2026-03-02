import { NextRequest, NextResponse } from "next/server";
import { db, widgets, workspaces, eq, desc, count } from "@testimonialkit/db";
import { auth } from "@/auth";
import { PLANS } from "@/lib/stripe";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["wall", "slider", "card"]).default("wall"),
  config: z
    .object({
      theme: z.string().optional(),
      accentColor: z.string().optional(),
      maxCount: z.number().optional(),
      showRating: z.boolean().optional(),
      showCompany: z.boolean().optional(),
    })
    .optional()
    .default({}),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceId = (session.user as any).workspaceId as string | null;
  if (!workspaceId) {
    return NextResponse.json({ error: "No workspace" }, { status: 400 });
  }

  try {
    const rows = await db
      .select()
      .from(widgets)
      .where(eq(widgets.workspaceId, workspaceId))
      .orderBy(desc(widgets.createdAt));

    return NextResponse.json({ widgets: rows });
  } catch (err) {
    console.error("[widgets GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceId = (session.user as any).workspaceId as string | null;
  if (!workspaceId) {
    return NextResponse.json({ error: "No workspace" }, { status: 400 });
  }

  // Plan-based widget limit: Free=1, Indie=5, Pro=unlimited
  const [workspace] = await db
    .select({ plan: workspaces.plan })
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);

  if (workspace) {
    const plan = workspace.plan as keyof typeof PLANS;
    const widgetLimit = PLANS[plan]?.widgetLimit ?? 1;

    if (widgetLimit !== Infinity) {
      const [{ value: widgetCount }] = await db
        .select({ value: count() })
        .from(widgets)
        .where(eq(widgets.workspaceId, workspaceId));

      if (widgetCount >= widgetLimit) {
        const planName = PLANS[plan]?.name ?? plan;
        return NextResponse.json(
          {
            error: `Widget limit reached (${widgetLimit} on ${planName} plan). Upgrade to create more.`,
          },
          { status: 402 }
        );
      }
    }
  }

  const body = await req.json().catch(() => ({}));
  const parsed = createSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  try {
    const [widget] = await db
      .insert(widgets)
      .values({
        workspaceId,
        name: parsed.data.name,
        type: parsed.data.type,
        config: parsed.data.config,
        active: true,
      })
      .returning();

    return NextResponse.json({ widget }, { status: 201 });
  } catch (err) {
    console.error("[widgets POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
