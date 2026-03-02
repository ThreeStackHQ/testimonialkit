import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;

  // Only allow collect.js and wall.js
  const allowed = ["collect.js", "wall.js"];
  if (!allowed.includes(name)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const filePath = join(process.cwd(), "../../packages/widget/dist", name);
    const content = readFileSync(filePath, "utf-8");

    return new NextResponse(content, {
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error(`[widget/${name}]`, err);
    return new NextResponse("Widget not found", { status: 404 });
  }
}
