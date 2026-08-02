export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import PostDetailPage from "../../news/[id]/page";

export default async function CategoryPostDetailPage({
  params,
}: {
  params: Promise<{ category: string; id: string }>;
}) {
  const resolvedParams = await params;
  return <PostDetailPage params={Promise.resolve({ id: resolvedParams.id })} />;
}
