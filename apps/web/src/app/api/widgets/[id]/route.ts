import { NextRequest, NextResponse } from "next/server";
import { db, widgets, eq, and } from "@testimonialkit/db";
import { auth } from "@/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(["wall", "slider", "card"]).optional(),
  active: z.boolean().optional(),
  config: z
    .object({
      theme: z.string().optional(),
      accentColor: z.string().optional(),
      maxCount: z.number().optional(),
      showRating: z.boolean().optional(),
      showCompany: z.boolean().optional(),
    })
    .optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceId = (session.user as any).workspaceId as string | null;
  if (!workspaceId) {
    return NextResponse.json({ error: "No workspace" }, { status: 400 });
  }

  const { id } = await params;

  const body = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  try {
    const [widget] = await db
      .update(widgets)
      .set({
        ...(parsed.data.name !== undefined && { name: parsed.data.name }),
        ...(parsed.data.type !== undefined && { type: parsed.data.type }),
        ...(parsed.data.active !== undefined && { active: parsed.data.active }),
        ...(parsed.data.config !== undefined && { config: parsed.data.config }),
      })
      .where(and(eq(widgets.id, id), eq(widgets.workspaceId, workspaceId)))
      .returning();

    if (!widget) {
      return NextResponse.json({ error: "Widget not found" }, { status: 404 });
    }

    return NextResponse.json({ widget });
  } catch (err) {
    console.error("[widgets PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceId = (session.user as any).workspaceId as string | null;
  if (!workspaceId) {
    return NextResponse.json({ error: "No workspace" }, { status: 400 });
  }

  const { id } = await params;

  try {
    const [deleted] = await db
      .delete(widgets)
      .where(and(eq(widgets.id, id), eq(widgets.workspaceId, workspaceId)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Widget not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[widgets DELETE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
