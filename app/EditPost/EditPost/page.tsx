'use client';

export const dynamic = 'force-dynamic'; // <-- Add this to disable static rendering


import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../firebase';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/navbar';

export default function EditPostPage() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { id } = useParams(); // Get the post ID from the URL

    useEffect(() => {
        const fetchPost = async () => {
            try {
                if (!id) {
                    throw new Error('Post ID is undefined');
                }
                const postDoc = await getDoc(doc(db, 'posts', id));
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
    }, [id, router]);

    const handleUpdatePost = async () => {
        if (!title || !content) {
            alert('Please fill in all fields.');
            return;
        }

        try {
            let updatedImageUrl = existingImageUrl;

            if (image) {
                // Upload the new image to Firebase Storage
                const imageRef = ref(storage, `posts/${id}/${image.name}`);
                await uploadBytes(imageRef, image);
                updatedImageUrl = await getDownloadURL(imageRef);
            }

            // Update the post in Firestore
            await updateDoc(doc(db, 'posts', id), {
                title,
                content,
                imageUrl: updatedImageUrl,
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
        <ProtectedRoute>
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
                        <img
                            src={existingImageUrl}
                            alt="Current Post"
                            className="w-1/4 h-auto mt-2" // Set width to 1/4 of the container
                        />
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
        </ProtectedRoute>
    );
}