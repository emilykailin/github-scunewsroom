'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../../firebase'; // Import auth here
import Navbar from '@/components/navbar';

export default function EditPPage() {
  const searchParams = useSearchParams();
  const postId = searchParams.get('id'); // Get the post ID from the query parameter
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) {
        alert('No post ID provided.');
        router.push('/Post'); // Redirect back to the Post page
        return;
      }

      try {
        const postDoc = await getDoc(doc(db, 'posts', postId));
        if (postDoc.exists()) {
          const data = postDoc.data();
          setTitle(data.title || '');
          setContent(data.content || '');
          setExistingImageUrl(data.imageUrl || '');
        } else {
          alert('Post not found!');
          router.push('/Post'); // Redirect back to the Post page if the post doesn't exist
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, router]);

  const handleUpdatePost = async () => {
    if (!title || !content) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      let updatedImageUrl = existingImageUrl;

      if (image) {
        // Upload the new image to Firebase Storage
        const user = auth.currentUser;
        if (!user) {
          alert('You must be logged in to update the post.');
          return;
        }

        const imageRef = ref(storage, `posts/${user.uid}/${image.name}`);
        console.log('Uploading new image to path:', `posts/${user.uid}/${image.name}`);
        await uploadBytes(imageRef, image);
        updatedImageUrl = await getDownloadURL(imageRef);
      }

      // Update the post in Firestore
      if (!postId) {
        throw new Error('Post ID is null or undefined.');
      }
      await updateDoc(doc(db, 'posts', postId), {
        title,
        content,
        imageUrl: updatedImageUrl, // Update the image URL to the new one
      });

      alert('Post updated successfully!');
      router.push('/Post'); // Redirect back to the Post page
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Navbar />
      <main className="p-4">
        <h1 className="text-2xl font-bold mb-4">Edit Post</h1>
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
        {existingImageUrl && (
          <div className="mb-4">
            <p className="text-gray-600">Current Image:</p>
            <img src={existingImageUrl} alt="Current Post" className="w-full h-auto mt-2" />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
          className="mb-4"
        />
        <button
          onClick={handleUpdatePost}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Update Post
        </button>
      </main>
    </>
  );
}