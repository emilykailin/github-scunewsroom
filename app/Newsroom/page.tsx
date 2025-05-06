'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import Navbar from '@/components/navbar';
import { Star, Star as StarOutline } from "lucide-react";

export default function NewsroomPage() {
  const [posts, setPosts] = useState<
    { id: string; title: string; content: string; imageUrl: string; createdAt: any }[]
  >([]);
  const [starredPosts, setStarredPosts] = useState<string[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(postsQuery);
      const postsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsData);
    };

    const fetchStarredPosts = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userDoc = await getDocs(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setStarredPosts(userDoc.data().starredPosts || []);
      }
    };

    fetchPosts();
    fetchStarredPosts();
  }, []);

  const toggleStarPost = async (postId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    const updatedStarredPosts = starredPosts.includes(postId)
      ? starredPosts.filter((id) => id !== postId)
      : [...starredPosts, postId];

    await updateDoc(userDocRef, { starredPosts: updatedStarredPosts });
    setStarredPosts(updatedStarredPosts);
  };

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-10 bg-white min-h-screen">
        <h1 className="text-4xl text-black font-bold mb-4">Newsroom</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <div key={post.id} className="p-4 rounded bg-gray-100">
              <h2 className="text-xl font-bold">{post.title}</h2>
              <button
                onClick={() => toggleStarPost(post.id)}
                className="py-2 rounded cursor-pointer"
              >
                {starredPosts.includes(post.id) ? (
                  <Star className="h-6 w-6 text-red-500" />
                ) : (
                  <StarOutline className="h-6 w-6 text-black-300" />
                )}
              </button>
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
    </>
  );
}