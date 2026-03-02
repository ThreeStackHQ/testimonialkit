import { db, testimonialTokens, testimonials, workspaces, eq } from "@testimonialkit/db";
import { notFound } from "next/navigation";
import CollectForm from "./CollectForm";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function CollectPage({ params }: Props) {
  const { token } = await params;

  const [tokenRecord] = await db
    .select()
    .from(testimonialTokens)
    .where(eq(testimonialTokens.token, token as any))
    .limit(1);

  if (!tokenRecord) notFound();

  const now = new Date();

  if (tokenRecord.usedAt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Already submitted!</h1>
          <p className="text-gray-500">This testimonial link has already been used. Thank you for your feedback!</p>
        </div>
      </div>
    );
  }

  if (tokenRecord.expiresAt < now) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">⏰</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Link expired</h1>
          <p className="text-gray-500">This testimonial link has expired. Please request a new one.</p>
        </div>
      </div>
    );
  }

  const [workspace] = await db
    .select({ name: workspaces.name })
    .from(workspaces)
    .where(eq(workspaces.id, tokenRecord.workspaceId))
    .limit(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-brand mx-auto flex items-center justify-center text-white font-bold text-xl mb-4">T</div>
          <h1 className="text-2xl font-bold text-gray-900">
            Share your feedback
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {workspace ? `Tell us about your experience with ${workspace.name}` : "We'd love to hear your thoughts!"}
          </p>
        </div>
        <CollectForm
          token={token}
          email={tokenRecord.email}
          workspaceId={tokenRecord.workspaceId}
        />
      </div>
    </div>
  );
}
