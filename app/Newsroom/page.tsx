'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import Navbar from '@/components/navbar';

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
      <main className="p-4">
        <h1 className="text-2xl font-bold mb-4">Newsroom</h1>
        <div className="space-y-4">
          {posts.map((post) => (
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
              <button
                onClick={() => toggleStarPost(post.id)}
                className={`mt-2 px-4 py-2 rounded ${
                  starredPosts.includes(post.id) ? 'bg-yellow-500' : 'bg-gray-300'
                }`}
              >
                {starredPosts.includes(post.id) ? 'Unstar' : 'Star'}
              </button>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}