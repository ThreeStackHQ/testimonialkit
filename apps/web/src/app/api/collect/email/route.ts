import { NextRequest, NextResponse } from "next/server";
import { db, testimonialTokens, workspaces, eq } from "@testimonialkit/db";
import { auth } from "@/auth";
import { Resend } from "resend";
import { z } from "zod";

export const dynamic = "force-dynamic";

const emailSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceId = (session.user as any).workspaceId;
  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);

  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = emailSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }

  const { email, name } = parsed.data;

  // Create token (7 days expiry)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const [tokenRecord] = await db
    .insert(testimonialTokens)
    .values({
      workspaceId,
      email,
      expiresAt,
    })
    .returning();

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const collectUrl = `${baseUrl}/collect/${tokenRecord.token}`;

  // Send email via Resend
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "TestimonialKit <noreply@testimonialkit.threestack.io>",
      to: email,
      subject: `Share your feedback about ${workspace.name}`,
      html: buildEmailHtml({
        name: name || "there",
        workspaceName: workspace.name,
        collectUrl,
      }),
    });
  } catch (err) {
    console.error("[collect/email] resend error", err);
    // Don't fail — token was created
  }

  return NextResponse.json({
    success: true,
    token: tokenRecord.token,
    expiresAt: tokenRecord.expiresAt,
  });
}

function buildEmailHtml({
  name,
  workspaceName,
  collectUrl,
}: {
  name: string;
  workspaceName: string;
  collectUrl: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;max-width:100%;">
          <tr>
            <td style="background:#0d9488;padding:24px 32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:rgba(255,255,255,.15);width:36px;height:36px;border-radius:8px;text-align:center;vertical-align:middle;">
                    <span style="color:#fff;font-weight:700;font-size:18px;">T</span>
                  </td>
                  <td style="padding-left:10px;color:#fff;font-weight:700;font-size:20px;">TestimonialKit</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h1 style="color:#f8fafc;font-size:22px;margin:0 0 12px;">Hi ${name}! 👋</h1>
              <p style="color:#94a3b8;font-size:15px;line-height:1.6;margin:0 0 24px;">
                <strong style="color:#e2e8f0;">${workspaceName}</strong> would love to hear your feedback. It only takes 2 minutes!
              </p>
              <a href="${collectUrl}" style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:15px;">
                Share your testimonial →
              </a>
              <p style="color:#64748b;font-size:13px;margin:24px 0 0;">
                This link expires in 7 days. If you didn't expect this email, you can safely ignore it.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #334155;">
              <p style="color:#475569;font-size:12px;margin:0;">
                Powered by <a href="https://testimonialkit.threestack.io" style="color:#0d9488;text-decoration:none;">TestimonialKit</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
