import { NextRequest, NextResponse } from "next/server";
import { db, widgets, eq, desc } from "@testimonialkit/db";
import { auth } from "@/auth";
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
