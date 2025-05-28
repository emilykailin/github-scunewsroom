'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, getDoc, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import Navbar from '@/components/navbar';
import { Star, Star as StarOutline } from "lucide-react";
import { generateICS } from './generateICS';
import { Timestamp } from 'firebase/firestore';

export default function NewsroomPage() {
  const [posts, setPosts] = useState<
    { id: string; title: string; content: string; imageUrl: string; createdAt: any; eventDate?: string; }[]
  >([]);
  const [starredPosts, setStarredPosts] = useState<string[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(postsQuery);
      const postsData = querySnapshot.docs.map((doc) => {
        const data = doc.data() as {
          title: string;
          content: string;
          imageUrl: string;
          createdAt: any;
          eventDate?: string; // testing added this

        };
      
        return {
          id: doc.id,
          title: data.title,
          content: data.content,
          imageUrl: data.imageUrl,
          createdAt: data.createdAt,
          eventDate: data.eventDate || '',
        };
      });
      
      setPosts(postsData);
    };

    const fetchStarredPosts = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        setStarredPosts(userDocSnap.data().starredPosts || []);
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

  const handleDownloadICS = (post: any) => {
    // update this with proper event start/end times
    const icsContent = generateICS({
      title: post.title,
      description: post.content,
      start: new Date(post.createdAt?.seconds * 1000).toISOString(), // placeholder start time
      end: new Date(post.createdAt?.seconds * 1000 + 3600000).toISOString(), // placeholder end time (1 hour later)
      location: 'Santa Clara University', // update with a dynamic location
    });
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${post.title.replace(/\s+/g, '_')}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-10 bg-white min-h-screen">
        <h1 className="text-4xl text-black font-bold mb-4">Newsroom</h1>
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="break-inside-avoid bg-gray-100 shadow p-4 rounded mb-4">
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
              {post.eventDate && post.eventDate.trim() !== '' && (
                <p className="text-sm text-blue-600">
                  Event Date: {new Date(post.eventDate).toLocaleDateString()}
                </p>
              )}
              <button
                onClick={() => handleDownloadICS(post)}
                className="bg-yellow-400 hover:bg-gray-400 text-white mt-4 px-4 py-2 rounded cursor-pointer"
              >
                Add to Calendar
              </button>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
