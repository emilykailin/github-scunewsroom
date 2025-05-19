'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import Navbar from '@/components/navbar';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function FavoritesPage() {
  const [starredPosts, setStarredPosts] = useState<
    { id: string; title: string; content: string; imageUrl: string; createdAt: any }[]
  >([]);

  useEffect(() => {
    const fetchStarredPosts = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      //??
      if (userDoc.exists()) 
      {
        const starredPostIds = userDoc.data().starredPosts || [];

        const posts = await Promise.all(

        starredPostIds.map(async (postId: string) => {
          const postDoc = await getDoc(doc(db, 'posts', postId));
          if (postDoc.exists()) {
            return { id: postId, ...postDoc.data() };
          }
          return null;
          })
        );

        const filteredSortedPosts = posts
        .filter(Boolean)
        .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);

        setStarredPosts(filteredSortedPosts);
      }
    };

    fetchStarredPosts();
  }, []);

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