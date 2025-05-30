'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../firebase'; // Import Firebase auth
import NewsroomPage from './Newsroom/page'; // Import the Newsroom page

export default function RootPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true); // User is logged in
        document.title = 'Newsroom';
      } else {
        router.push('/LogIn'); // Redirect to LogIn if not logged in
        document.title = 'Log In';
      }
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, [router]);

  if (!isAuthenticated) {
    return null; // Render nothing while redirecting
  }

  return <NewsroomPage />; // Render the Newsroom page if authenticated
}
