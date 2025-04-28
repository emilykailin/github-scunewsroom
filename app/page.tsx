'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import LoginPage from './LogIn/page';

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
    <>
      <LoginPage></LoginPage>
    </>
  );
}
