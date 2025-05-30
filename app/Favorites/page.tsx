'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import Navbar from '@/components/navbar';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function FavoritesPage() {
  const [starredPosts, setStarredPosts] = useState<
    { id: string; title: string; content: string; imageUrl: string; createdAt: any; eventDate?: any; hidden?: boolean; }[]
  >([]);

  useEffect(() => {
    const fetchStarredPosts = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const starredPostIds = userDoc.data().starredPosts || [];
        const postsPromises = starredPostIds.map(async (postId: string) => {
          const postDoc = await getDoc(doc(db, 'posts', postId));
          if (postDoc.exists()) {
            const postData = postDoc.data();
            if (!postData.hidden) { // Check if the post is not hidden
              return {
                id: postId,
                title: postData.title || '',
                content: postData.content || '',
                imageUrl: postData.imageUrl || '',
                createdAt: postData.createdAt || null,
                eventDate: postData.eventDate || null,
              };
            }
          }
          return null; 
        });
        const resolvedPosts = await Promise.all(postsPromises);
        const validPosts = resolvedPosts.filter(post => post !== null) as { id: string; title: string; content: string; imageUrl: string; createdAt: any; hidden?: boolean }[];
        setStarredPosts(validPosts);
      }
    };

    fetchStarredPosts();
  }, []);

 const formatDate = (ts: any) => {
  const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
  const date = d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  const weekday = d.toLocaleDateString(undefined, { weekday: 'long' });
  return `${date} (${weekday})`;
 };

 const formatTime = (ts: any) => {
  const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
 };

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
              {post.eventDate && (
                  <p className="text-sm text-blue-600">
                   Event Date: {formatDate(post.eventDate)} {formatTime(post.eventDate)}
                  </p>
              )}
            </div>
          ))}
        </div>
      </main>
    </ProtectedRoute>
  );
}