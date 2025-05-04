'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth, db, storage } from '../../firebase';
import Navbar from '@/components/navbar';

export default function PostPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [posts, setPosts] = useState<
    { id: string; title: string; content: string; imageUrl: string; createdAt: any }[]
  >([]);
  const router = useRouter();

  useEffect(() => {
    const checkAdminRole = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.log("No user is logged in.");
        router.push('/Newsroom'); // Redirect to Newsroom if not authenticated
        setLoading(false); // Stop loading
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          console.log("User document:", userDoc.data());
          const role = userDoc.data().role;
          if (role === 'admin') {
            setIsAdmin(true); // User is an admin
            fetchUserPosts(user.uid); // Fetch the admin's posts
          } else {
            console.log("User is not an admin. Redirecting to Newsroom.");
            router.push('/Newsroom'); // Redirect non-admins to Newsroom
          }
        } else {
          console.log("User document does not exist. Redirecting to Newsroom.");
          router.push('/Newsroom'); // Redirect if user document does not exist
        }
      } catch (error) {
        console.error("Error checking admin role:", error);
        router.push('/Newsroom'); // Redirect on error
      } finally {
        setLoading(false); // Stop loading
      }
    };

    checkAdminRole();
  }, [router]);

  const fetchUserPosts = async (userId: string) => {
    try {
      const postsQuery = query(collection(db, 'posts'), where('authorId', '==', userId));
      const querySnapshot = await getDocs(postsQuery);
      const userPosts = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || '',
          content: data.content || '',
          imageUrl: data.imageUrl || '',
          createdAt: data.createdAt || null,
        };
      });
      console.log("Fetched user posts:", userPosts);
      setPosts(userPosts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  };

  const handleCreatePost = async () => {
    if (!title || !content || !image) {
      alert('Please fill in all fields and upload an image.');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) return;

      // Upload the image to Firebase Storage
      const imageRef = ref(storage, `posts/${user.uid}/${image.name}`);
      await uploadBytes(imageRef, image);
      const imageUrl = await getDownloadURL(imageRef);

      // Save the post metadata to Firestore
      await addDoc(collection(db, 'posts'), {
        title,
        content,
        imageUrl,
        authorId: user.uid,
        author: user.email,
        createdAt: serverTimestamp(),
      });

      alert('Post created successfully!');
      fetchUserPosts(user.uid); // Refresh the user's posts
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleDeletePost = async (postId: string, imageUrl: string) => {
    try {
      // Delete the image from Firebase Storage
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);

      // Delete the post from Firestore
      await deleteDoc(doc(db, 'posts', postId));

      alert('Post deleted successfully!');
      const user = auth.currentUser;
      if (user) fetchUserPosts(user.uid); // Refresh the user's posts
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleEditPost = async (postId: string, updatedTitle: string, updatedContent: string, newImage?: File) => {
    try {
      let updatedImageUrl = null;

      if (newImage) {
        const user = auth.currentUser;
        if (!user) return;

        // Upload the new image to Firebase Storage
        const imageRef = ref(storage, `posts/${user.uid}/${newImage.name}`);
        await uploadBytes(imageRef, newImage);
        updatedImageUrl = await getDownloadURL(imageRef);
      }

      // Update the post in Firestore
      const updatedData: any = {
        title: updatedTitle,
        content: updatedContent,
      };

      if (updatedImageUrl) {
        updatedData.imageUrl = updatedImageUrl;
      }

      await updateDoc(doc(db, 'posts', postId), updatedData);

      alert('Post updated successfully!');
      const user = auth.currentUser;
      if (user) fetchUserPosts(user.uid); // Refresh the user's posts
    } catch (error) {
      console.error('Error updating post:', error);
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

        <h2 className="text-xl font-bold mt-8">Your Posts</h2>
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="border p-4 rounded">
              <h3 className="text-lg font-bold">{post.title}</h3>
              <p className="text-gray-600">{post.content}</p>
              {post.imageUrl && (
                <img src={post.imageUrl} alt={post.title} className="w-full h-auto mt-4" />
              )}
              <p className="text-sm text-gray-500">
                Posted on {new Date(post.createdAt?.seconds * 1000).toLocaleString()}
              </p>
              <div className="flex space-x-4 mt-4">
                <button
                  onClick={() =>
                    handleEditPost(
                      post.id,
                      prompt('Edit Title:', post.title) || post.title,
                      prompt('Edit Content:', post.content) || post.content
                    )
                  }
                  className="bg-yellow-500 text-white px-4 py-2 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeletePost(post.id, post.imageUrl)}
                  className="bg-red-600 text-white px-4 py-2 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}