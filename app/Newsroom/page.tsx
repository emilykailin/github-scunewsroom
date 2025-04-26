'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

export default function NewsroomPage() {
  const [articles, setArticles] = useState<{ id: string; title?: string; content?: string; author?: string }[]>([]);

  useEffect(() => {
    const fetchArticles = async () => {
      const querySnapshot = await getDocs(collection(db, 'articles'));
      const articlesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setArticles(articlesData);
    };

    fetchArticles();
  }, []);

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Newsroom</h1>
      <div className="space-y-4">
        {articles.map((article) => (
          <div key={article.id} className="border p-4 rounded">
            <h2 className="text-xl font-bold">{article.title}</h2>
            <p className="text-gray-600">{article.content}</p>
            <p className="text-sm text-gray-500">By {article.author}</p>
          </div>
        ))}
      </div>
    </main>
  );
}