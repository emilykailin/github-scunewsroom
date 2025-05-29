'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/navbar';

export default function FavoritesPage() {
  return (
    <ProtectedRoute>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-10 bg-white min-h-screen">
        <h1 className="text-4xl text-black font-bold mb-4">Favorites</h1>
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
          {starredPosts.map((post) => (
            <div key={post.id} className="break-inside-avoid bg-gray-100 shadow p-4 rounded mb-4">
              <h2 className="text-xl font-bold">{post.title}</h2>
              <p className="text-gray-600">{post.content}</p>
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-auto mt-4"
                />
              )}
              <p className="text-sm text-gray-500">
                Posted on {new Date(post.createdAt?.seconds * 1000).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </main>
    </ProtectedRoute>
  );
}