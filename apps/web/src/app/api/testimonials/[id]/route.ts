import { NextRequest, NextResponse } from "next/server";
import { db, testimonials, eq, and } from "@testimonialkit/db";
import { auth } from "@/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  text: z.string().min(1).optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  featured: z.boolean().optional(),
  name: z.string().optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

async function getTestimonial(id: string, workspaceId: string) {
  const [t] = await db
    .select()
    .from(testimonials)
    .where(and(eq(testimonials.id, id), eq(testimonials.workspaceId, workspaceId)))
    .limit(1);
  return t;
}

// PATCH — update testimonial
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

  const existing = await getTestimonial(id, workspaceId);
  if (!existing) {
    return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }

  try {
    const [updated] = await db
      .update(testimonials)
      .set({ ...parsed.data })
      .where(and(eq(testimonials.id, id), eq(testimonials.workspaceId, workspaceId)))
      .returning();

    return NextResponse.json({ testimonial: updated });
  } catch (err) {
    console.error("[testimonial PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE — remove testimonial
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const workspaceId = (session.user as any).workspaceId;

  const existing = await getTestimonial(id, workspaceId);
  if (!existing) {
    return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
  }

  try {
    await db
      .delete(testimonials)
      .where(and(eq(testimonials.id, id), eq(testimonials.workspaceId, workspaceId)));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[testimonial DELETE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
