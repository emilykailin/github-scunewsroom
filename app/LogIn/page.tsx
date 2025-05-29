'use client';

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { provider } from '../../firebase';
import { signInWithPopup, signOut, getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import { firebaseConfig } from '../../firebase';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      router.push('/Newsroom'); // Redirect logged-in users to the Newsroom page
    }
  }, [router]);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Signed in successfully");
      const user = result.user;
      console.log("User:", user.uid, user.email);

      if (user.email && user.email.endsWith('@scu.edu')) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          await setDoc(
            userDocRef,
            { role: 'user', email: user.email, adminRequest: false, categories: [], weeklyTop5: false },
            { merge: true }
          );
          router.push('/Preferences');
        } else {
          router.push('/Newsroom');
        }
      } else {
        await signOut(auth);
        setError('You must use an email ending with @scu.edu.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'An error occurred during login. Please try again.');
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center pt-60 bg-white min-h-screen">
        <div className="text-center bg-red-700 rounded-lg p-20">
          <h1 className="text-5xl font-bold mb-4 text-white">SCU Newsroom</h1>
          <h1 className="text-3xl font-bold mb-6 text-white">Login</h1>
          {error && <p className="text-red-600 mb-4">{error}</p>}
          <button
            onClick={handleGoogleLogin}
            className="bg-yellow-400 hover:bg-gray-400 text-white px-4 py-2 rounded cursor-pointer"
          >
            Sign in with Google
          </button>
        </div>
      </main>
    </>
  );
}