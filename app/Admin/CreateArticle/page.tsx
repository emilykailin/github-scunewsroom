'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addDoc, collection } from 'firebase/firestore';
import { auth, db } from '../../../firebase';

export default function CreateArticlePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const router = useRouter();

  const handleCreateArticle = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await addDoc(collection(db, 'articles'), {
        title,
        content,
        author: user.email,
        createdAt: new Date(),
      });
      alert('Article created successfully!');
      router.push('/Newsroom');
    } catch (error) {
      console.error('Error creating article:', error);
    }
  };

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Create Article</h1>
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
      <button
        onClick={handleCreateArticle}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Create Article
      </button>
    </main>
  );
}