'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import Navbar from '@/components/navbar';

export default function ForYouPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCuratedArticles = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.warn('User not logged in');
        setLoading(false);
        return;
      }

      try {
        //Get user preferences
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        const preferences = userData?.categories || [];

        if (preferences.length === 0) {
          console.warn('User has no category preferences');
          setLoading(false);
          return;
        }

        //Query articles by category
        const articlesRef = collection(db, 'articles');
        const q = query(articlesRef, where('category', 'in', preferences));
        const querySnapshot = await getDocs(q);

        const fetchedArticles = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setArticles(fetchedArticles);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCuratedArticles();
  }, []);

  return (
    <>
      <Navbar />
      <main className="p-4">
        <h1 className="text-2xl font-bold mb-4">For You</h1>
        {loading ? (
          <p>Loading...</p>
        ) : articles.length === 0 ? (
          <p>No articles found matching your preferences.</p>
        ) : (
          <ul>
            {articles.map((article) => (
              <li key={article.id}>
                <h2>{article.title}</h2>
                <p>{article.content}</p>
                <p><strong>Category:</strong> {article.category}</p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
