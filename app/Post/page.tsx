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
  const [categories, setCategories] = useState<string[]>([]); // New state for categories
  const [eventDate, setEventDate] = useState('');
  const [posts, setPosts] = useState<
    { id: string; title: string; content: string; imageUrl: string; createdAt: any; categories: string[] }[]
  >([]);
  const router = useRouter();

  const preferences = [
    'Arts & Sciences',
    'Business',
    'Engineering',
    'Art History',
    'On-Campus Housing',
    'Into The Wild',
    'Club Sports',
    'Athletics',
    'Performing Arts',
    'SCAPP',
    'ASG',
    'APB',
  ];

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
          const role = userDoc.data().role;
          if (role === 'admin') {
            setIsAdmin(true); // User is an admin
            fetchUserPosts(user.uid); // Fetch the admin's posts
          } else {
            router.push('/Newsroom'); // Redirect non-admins to Newsroom
          }
        } else {
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
      const userPosts = querySnapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || '',
            content: data.content || '',
            imageUrl: data.imageUrl || '',
            createdAt: data.createdAt || null,
            categories: data.categories || [], // Include categories
            hidden: data.hidden || false,
          };
        })
        .filter((post) => !post.hidden); // Exclude hidden posts
      setPosts(userPosts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const handleCreatePost = async () => {
    if (!title || !content || !image || categories.length === 0) {
      alert('Please fill in all fields, upload an image, and select at least one category.');
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
        categories, // Save selected categories
        authorId: user.uid,
        author: user.email,
        createdAt: serverTimestamp(),
        eventDate: eventDate ? new Date(eventDate) : null // Save it

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

  const handleHidePost = async (postId: string) => {
    const confirmDelete = confirm('Are you sure you want to hide this post?');
    if (!confirmDelete) return;
  
    try {
      // Update the post in Firestore to set `hidden` to true
      await updateDoc(doc(db, 'posts', postId), { hidden: true });
  
      alert('Post hidden successfully!');
      const user = auth.currentUser;
      if (user) fetchUserPosts(user.uid); // Refresh the user's posts
    } catch (error) {
      console.error('Error hiding post:', error);
    }
  };

  const handleCategoryChange = (category: string) => {
    setCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
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
      <main className="max-w-7xl mx-auto px-4 py-10 bg-white min-h-screen">
        <h1 className="text-4xl text-black font-bold mb-4">Create a Post</h1>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 mb-4 w-full rounded"
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="border p-2 mb-4 w-full rounded"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
          className="mb-4"
        />
        <input //TYPE DATE
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className="border p-2 mb-4 w-full rounded"
        /> 
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Categories</h2>
          <div className="flex flex-wrap gap-2 pt-4">
            {preferences.map((category) => {
              const isSelected = categories.includes(category);
              return (
                <label
                  key={category}
                  className={`cursor-pointer text-xl px-4 py-2 rounded text-sm font-medium transition 
                    ${
                      isSelected
                        ? 'bg-gray-700 text-white'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                >
                  <input
                    type="checkbox"
                    value={category}
                    checked={isSelected}
                    onChange={() => handleCategoryChange(category)}
                    className="hidden"
                  />
                  {category}
                </label>
              );
            })}
          </div>
        </div>
        <button
          onClick={handleCreatePost}
          className="bg-yellow-400 hover:bg-gray-400 text-white px-4 py-2 rounded cursor-pointer"
       >
          Create Post
        </button>

        <h2 className="text-xl font-bold mt-8">Your Posts</h2>
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="break-inside-avoid bg-gray-100 shadow p-4 rounded mb-4">
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
                Categories: {post.categories.join(', ')}
              </p>
              <p className="text-sm text-gray-500">
                Posted on {new Date(post.createdAt?.seconds * 1000).toLocaleString()}
              </p>
              <div className="flex space-x-4 mt-4">
                <button
                  onClick={() => router.push(`/EditP?id=${post.id}`)} // Navigate to EditP with the post ID as a query parameter
                  className="bg-yellow-500 text-white px-4 py-2 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleHidePost(post.id)} // Use the hide functionality
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