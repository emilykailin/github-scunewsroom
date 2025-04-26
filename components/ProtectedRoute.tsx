'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true); // User is logged in
      } else {
        setIsAuthenticated(false);
        router.push('/LogIn'); // Redirect to login page if not authenticated
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [router]);

  if (!isAuthenticated) {
    return null; // Render nothing while checking authentication
  }

  return <>{children}</>;
}