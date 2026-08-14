export const runtime = "nodejs";
export const revalidate = 60;

import PostDetailPage, { generateMetadata as generateNewsMetadata } from "../../news/[id]/page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; id: string }>;
}) {
  const resolvedParams = await params;
  return generateNewsMetadata({
    params: Promise.resolve({ id: resolvedParams.id, category: resolvedParams.category }),
  });
}

export default async function CategoryPostDetailPage({
  params,
}: {
  params: Promise<{ category: string; id: string }>;
}) {
  const resolvedParams = await params;
  return (
    <PostDetailPage
      params={Promise.resolve({ id: resolvedParams.id, category: resolvedParams.category })}
    />
  );
}

