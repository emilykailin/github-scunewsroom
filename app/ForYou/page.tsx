'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/navbar';

export default function ForYouPage() {
  return (
    <ProtectedRoute>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-10 bg-white min-h-screen">
        <h1 className="text-4xl font-bold mb-4">For You</h1>

        {loading ? (
          <p className="text-gray-600">Loading personalized posts…</p>
        ) : forYouPosts.length === 0 ? (
          <p className="text-gray-600">No posts match your preferences yet.</p>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {forYouPosts.map((post) => (
              <div
                key={post.id}
                className="break-inside-avoid bg-gray-100 shadow p-4 rounded mb-4"
              >
                <h2 className="text-xl font-bold">{post.title}</h2>
                <p className="text-gray-600">{post.content}</p>
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-auto mt-4"
                  />
                )}
                {post.createdAt?.seconds ? (
                  <p className="text-sm text-gray-500">
                    Posted on {new Date(post.createdAt.seconds * 1000).toLocaleString()}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">Posted on unknown date</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}