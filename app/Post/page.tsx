'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../../firebase';
import Navbar from '@/components/navbar';

export default function PostPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAdminRole = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push('/Newsroom'); // Redirect to Newsroom if not authenticated
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setIsAdmin(true); // User is an admin
        } else {
          router.push('/Newsroom'); // Redirect non-admins to Newsroom
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
        router.push('/Newsroom'); // Redirect on error
      } finally {
        setLoading(false); // Stop loading
      }
    };

    checkAdminRole();
  }, [router]);

  const handleCreatePost = async () => {
    console.log("Create Post button clicked"); // Debugging log
    if (!title || !content || !image) {
      alert('Please fill in all fields and upload an image.');
      console.log("Missing fields: ", { title, content, image });
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("User is not authenticated");
        return;
      }

      console.log("Authenticated user:", user);

      // Upload the image to Firebase Storage
      const imageRef = ref(storage, `posts/${user.uid}/${image.name}`);
      console.log("Uploading image to:", imageRef.fullPath);
      await uploadBytes(imageRef, image);
      console.log("Image uploaded successfully");

      const imageUrl = await getDownloadURL(imageRef);
      console.log("Image URL:", imageUrl);

      // Save the post metadata to Firestore
      await addDoc(collection(db, 'posts'), {
        title,
        content,
        imageUrl,
        author: user.email,
        createdAt: serverTimestamp(), // Use server timestamp for sorting
      });
      console.log("Post saved to Firestore");

      alert('Post created successfully!');
      router.push('/Newsroom'); // Redirect to Newsroom
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  if (loading) {
    return <p>Loading...</p>; // Show a loading message while checking role
  }

  if (!isAdmin) {
    return null; // Prevent rendering if the user is not an admin
  }

  return (
    <>
      <Navbar />
      <main className="p-4">
        <h1 className="text-2xl font-bold mb-4">Create a Post</h1>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 mb-4 w-full"
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="border p-2 mb-4 w-full"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
          className="mb-4"
        />
        <button
          onClick={handleCreatePost}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create Post
        </button>
      </main>
    </>
  );
}