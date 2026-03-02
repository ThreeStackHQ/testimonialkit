import { NextRequest, NextResponse } from "next/server";
import { db, testimonials, eq, and } from "@testimonialkit/db";
import { auth } from "@/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const statusSchema = z.object({
  status: z.enum(["approved", "rejected", "pending"]),
  featured: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const workspaceId = (session.user as any).workspaceId;

  const [existing] = await db
    .select()
    .from(testimonials)
    .where(and(eq(testimonials.id, id), eq(testimonials.workspaceId, workspaceId)))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }

  try {
    const updateData: Record<string, unknown> = { status: parsed.data.status };
    if (parsed.data.featured !== undefined) {
      updateData.featured = parsed.data.featured;
    }

    const [updated] = await db
      .update(testimonials)
      .set(updateData)
      .where(and(eq(testimonials.id, id), eq(testimonials.workspaceId, workspaceId)))
      .returning();

    return NextResponse.json({ testimonial: updated });
  } catch (err) {
    console.error("[testimonial status PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
