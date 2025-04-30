'use client';

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { provider } from '../../firebase';
import { signInWithPopup, signOut, getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import { firebaseConfig } from '../../firebase';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user.email && user.email.endsWith('@scu.edu')) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          console.log('Creating new user document...');
          // Set default fields for new users
          await setDoc(
            userDocRef,
            {
              role: 'user', // Default role
              email: user.email, // User's email
              adminRequest: false, // Default admin request status
              categories: [], // Default empty preferences
              weeklyTop5: false, // Default weekly top 5 subscription
            },
            { merge: true } // Merge fields instead of overwriting
          );
          console.log('New user document created in Firestore.');
        } else {
          console.log('User already exists in Firestore.');
        }

        // Log the document data for debugging
        const updatedUserDoc = await getDoc(userDocRef);
        console.log('Updated user document:', updatedUserDoc.data());

        router.push('/Preferences'); // Redirect to preferences page
      } else {
        await signOut(auth);
        setError('You must use an email ending with @scu.edu.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
    }
  };

  const handleSavePreferences = async () => {
    const user = auth.currentUser;
    if (!user) return;

    // Declare and initialize categories and weeklyTop5
    const categories: string[] = []; // Example: empty array for categories
    const weeklyTop5: boolean = false; // Example: default value for weeklyTop5

    try {
      await setDoc(
        doc(db, 'users', user.uid),
        {
          categories,
          weeklyTop5,
        },
        { merge: true } // Merge fields instead of overwriting
      );
      console.log('Preferences saved successfully!');

      // Redirect to the Newsroom page
      router.push('/Newsroom');
    } catch (error) {
      console.error('Error saving preferences:', error);
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