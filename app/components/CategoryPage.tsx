import { Inter } from "next/font/google";

const inter = Inter({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500", "600", "700"] 
});

interface Post {
  id: string;
  uri: string | null;
  title: string | null;
  slug: string;
  status: string;
  link: string;
  date: string;
  content: string | null;
  featuredImage?: string | null;
  excerpt?: string | null;
}

async function getCategoryPosts(category: string): Promise<Post[]> {
  try {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_SITE_URL || 'https://www.nepalvoices.com'
      : 'http://localhost:3000';
    
    const apiUrl = `${baseUrl}/api/category?category=${category}`;
    
    const res = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }
    });
    
    if (!res.ok) {
      return [];
    }
    
    const posts = await res.json();
    
    if (!Array.isArray(posts)) {
      return [];
    }
    
    return posts;
  } catch (error) {
    console.error('Error fetching category posts:', error);
    return [];
  }
}

function decodeHtmlEntities(text: string | null): string {
  if (!text) return "No preview available.";
  
  const decodedText = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '...');
  
  return decodedText;
}

function getCleanContent(content: string | null, maxLength: number = 200): string {
  if (!content) return "No preview available.";
  
  const decodedContent = decodeHtmlEntities(content);
  
  const cleanText = decodedContent
    .replace(/<[^>]*>/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\b\d+\/\d+\b/g, '')
    .replace(/\b\d+ of \d+\b/gi, '')
    .trim();
  
  return cleanText.substring(0, maxLength) + (cleanText.length > maxLength ? '...' : '');
}

function getCleanTitle(title: string | null): string {
  if (!title) return "Untitled Post";
  
  const decodedTitle = decodeHtmlEntities(title);
  
  return decodedTitle
    .replace(/\b\d+\/\d+\b/g, '')
    .replace(/\b\d+ of \d+\b/gi, '')
    .trim();
}

const categoryNames: { [key: string]: string } = {
  'politics': 'राजनीति',
  'society': 'समाज',
  'economy': 'अर्थतन्त्र',
  'technology': 'विज्ञान प्रविधि',
  'arts': 'कला साहित्य',
  'sports': 'खेलकुद',
  'world': 'विश्व',
  'podcast': 'Podcast'
};

export default async function CategoryPage({ 
  categorySlug 
}: { 
  categorySlug: string 
}) {
  const categoryName = categoryNames[categorySlug] || categorySlug;
  
  const posts = await getCategoryPosts(categorySlug);
  
  // If no posts, show fallback message
  if (posts.length === 0) {
    return (
      <div className={`${inter.className} min-h-screen bg-white text-nepal-black w-full`}>        
        <div className="pt-64"></div>
        
        <div className="flex items-center justify-center min-h-[60vh] w-full">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              <span className="text-nepal-black">{categoryName}</span>
            </h1>
            <p className="text-gray-600">No posts found in this category.</p>
          </div>
        </div>
        
        <div className="h-24 bg-transparent"></div>
        
      </div>
    );
  }

  return (
    <div className={`${inter.className} min-h-screen bg-white text-nepal-black overflow-x-hidden w-full`}>
      <div className="pt-64"></div>

      <main className="w-full">
        <div className="h-20 bg-transparent"></div>
        
        <section className="w-full">
          <div className="w-full max-w-[1920px] mx-auto px-8">
            <div className="flex items-center mb-12 border-b-4 border-nepal-orange pb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-nepal-black">
                {categoryName}
              </h1>
              <span className="ml-6 bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-lg">
                {posts.length} posts
              </span>
            </div>
          </div>
        </section>

        <div className="h-12 bg-transparent"></div>

        <section className="w-full">
          <div className="w-full max-w-[1920px] mx-auto px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full">
              {posts.map((post) => (
                <a 
                  key={post.id} 
                  href={post.link}
                  className="group cursor-pointer bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden w-full block"
                >
                  <div className="relative aspect-4/3 bg-gray-100 overflow-hidden">
                    {post.featuredImage ? (
                      <img 
                        src={post.featuredImage} 
                        alt={getCleanTitle(post.title)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <span className="text-gray-400 text-lg">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6 space-y-3">
                    <h3 className="font-bold text-xl leading-tight group-hover:text-nepal-orange transition-colors duration-300 line-clamp-3">
                      {getCleanTitle(post.title)}
                    </h3>
                    <p className="text-gray-600 text-base leading-relaxed line-clamp-3">
                      {getCleanContent(post.content, 120)}
                    </p>
                    <div className="text-gray-400 text-sm pt-2">
                      {new Date(post.date).toLocaleDateString('en-US', { 
                        timeZone: 'Asia/Kathmandu',
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <div className="h-24 bg-transparent"></div>
      </main>

    </div>
  );
}