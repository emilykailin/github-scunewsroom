'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc, deleteDoc, updateDoc, orderBy } from 'firebase/firestore';
import { auth, db, storage } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

import Navbar from '@/components/navbar';
import ProtectedRoute from '@/components/ProtectedRoute';

type Post = {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  categories?: string[];
  createdAt?: { seconds: number; nanoseconds: number };
  eventDate?: { seconds: number; nanoseconds: number };
  eventEndDate?: { seconds: number; nanoseconds: number };
  hidden?: boolean;
};

export default function ForYouPage() {
  const [forYouPosts, setForYouPosts] = useState<Post[]>([]);
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
        await Promise.all(starredPostIds.map(async (pid: string) => {
          const pSnap = await getDoc(doc(db, 'posts', pid));
          if (pSnap.exists()) {
            (pSnap.data().categories || []).forEach((c: string) => favoriteCategories.add(c));
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
        const allPosts: Post[] = postsSnap.docs.map(d => ({
          id: d.id,
          ...(d.data() as Omit<Post, 'id'>),
        }));
                console.log('Total posts fetched:', allPosts.length);

        const filtered = allPosts.filter((post) =>
          !post.hidden && (post.categories || []).some((c) => combined.includes(c))
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

 const handleAddtoGCal = (post: any) => {
  if (!post.eventDate) {
    alert('No event date set.');
    return;
  }

  const startDate = post.eventDate instanceof Timestamp
    ? post.eventDate.toDate()
    : new Date(post.eventDate);

  const endDate =
    post.eventEndDate instanceof Timestamp
      ? post.eventEndDate.toDate()
      : new Date(startDate.getTime() + 60 * 60 * 1000); // default 1 hour later

  const formatDate = (date: Date) =>
    date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE` +
    `&text=${encodeURIComponent(post.title)}` +
    `&dates=${formatDate(startDate)}/${formatDate(endDate)}` +
    `&details=${encodeURIComponent(post.content)}`;

  window.open(calendarUrl, '_blank');
};


const [starredPosts, setStarredPosts] = useState<string[]>([]);
const toggleStarPost = async (postId: string) => {
  const user = auth.currentUser;
  if (!user) return;

  const userDocRef = doc(db, 'users', user.uid);
  const updatedStarredPosts = starredPosts.includes(postId)
    ? starredPosts.filter((id) => id !== postId)
    : [...starredPosts, postId];

  try {
    await updateDoc(userDocRef, { starredPosts: updatedStarredPosts });
    setStarredPosts(updatedStarredPosts);
  } catch (err) {
    console.error('Failed to update favorites', err);
  }
};

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
                <div className="flex items-center gap-2">
                  {post.categories?.map((cat) => (
                    <span
                      key={cat}
                      className="text-xs bg-gray-200 px-2 py-1 rounded inline-block"
                    >
                      {cat}
                    </span>
                  )) ?? (
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                      Uncategorized
                    </span>
                  )}
                </div>
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
                {post.eventDate && (
                  <p className="text-sm text-blue-600">
                     Event Date: {formatDate(post.eventDate)} {formatTime(post.eventDate)}
                  </p>
                )}

                <button
                  onClick={() => handleAddtoGCal(post)}
                  className="bg-yellow-400 hover:bg-gray-400 text-white mt-4 px-4 py-2 rounded cursor-pointer"
                >
                  Add to Calendar
                </button>

              </div>
            ))}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}