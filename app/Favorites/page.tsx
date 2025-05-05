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
      if (userDoc.exists()) {
        const starredPostIds = userDoc.data().starredPosts || [];
        const posts = await Promise.all(
          starredPostIds.map(async (postId: string) => {
            const postDoc = await getDoc(doc(db, 'posts', postId));
            return { id: postId, ...postDoc.data() };
          })
        );
        setStarredPosts(posts);
      }
    };

    fetchStarredPosts();
  }, []);

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="p-4">
        <h1 className="text-2xl font-bold mb-4">Favorites</h1>
        <div className="space-y-4">
          {starredPosts.map((post) => (
            <div key={post.id} className="border p-4 rounded">
              <h2 className="text-xl font-bold">{post.title}</h2>
              <p className="text-gray-600">{post.content}</p>
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-1/4 h-auto mt-4"
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