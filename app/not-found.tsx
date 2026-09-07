import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-6xl font-black text-nepal-red font-nepali-serif mb-4">
        ४०४
      </h1>
      <h2 className="text-2xl font-bold text-gray-900 mb-2 font-nepali-serif">
        पृष्ठ फेला परेन (Page Not Found)
      </h2>
      <p className="text-gray-600 max-w-md mb-8 font-poppins text-sm">
        तपाईंले खोज्नुभएको पृष्ठ फेला परेन वा सारिएको हुनसक्छ।
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 bg-nepal-red text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-red-700 transition-colors"
      >
        गृहपृष्ठ जानुहोस् (Go to Homepage)
      </Link>
    </div>
  );
}
