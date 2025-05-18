'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc, deleteDoc, updateDoc, orderBy } from 'firebase/firestore';
import { auth, db, storage } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';

import Navbar from '@/components/navbar';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ForYouPage() {
  const [forYouPosts, setForYouPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return; // not logged in
      }

      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          console.warn('No user doc found for', user.uid);
          setLoading(false);
          return;
        }
        const userData = userSnap.data();
        const userCategories = userData.categories || [];
        const starredPostIds = userData.starredPosts || [];

        console.log('User categories:', userCategories);
        console.log('Starred post IDs:', starredPostIds);


        const favoriteCategories = new Set<string>();
        await Promise.all(starredPostIds.map(async (pid) => {
          const pSnap = await getDoc(doc(db, 'posts', pid));
          if (pSnap.exists()) {
            (pSnap.data().categories || []).forEach((c) => favoriteCategories.add(c));
          }
        }));
        console.log('Favorite-derived categories:', Array.from(favoriteCategories));

        // Combining favorited posts and regular posts that match preferences
        const combined = Array.from(new Set([
          ...userCategories,
          ...favoriteCategories,
        ]));
        console.log('Combined filter categories:', combined);

        // Filtering posts locally to not mess with anything
        const postsQ = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc')
        );
        const postsSnap = await getDocs(postsQ);
        const allPosts = postsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        console.log('Total posts fetched:', allPosts.length);

        const filtered = allPosts.filter((post) =>
          (post.categories || []).some((c) => combined.includes(c))
        );
        console.log('Posts after filter:', filtered.length);

        setForYouPosts(filtered);
      } catch (err) {
        console.error('Error fetching For You page data:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

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
                <p className="text-sm text-gray-500">
                  Posted on{' '}
                  {new Date(post.createdAt?.seconds * 1000).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}