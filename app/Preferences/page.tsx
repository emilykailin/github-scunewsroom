'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase'; // Use centralized Firebase initialization
import Navbar from '@/components/navbar';

export default function PreferencesPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [weeklyTop5, setWeeklyTop5] = useState(false);
  const router = useRouter();
  const hiddenButtonRef = useRef<HTMLButtonElement>(null);

  const handleCategoryChange = (category: string) => {
    setCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSavePreferences = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      // Save preferences to Firestore
      await setDoc(
        doc(db, 'users', user.uid),
        {
          categories,
          weeklyTop5,
        },
        { merge: true } // Merge fields instead of overwriting
      );
      console.log('Preferences saved successfully!');

      // Trigger the hidden button to set role and email
      hiddenButtonRef.current?.click();

      router.push('/'); // Redirect to homepage after saving preferences
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const handleSetRoleAndEmail = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      console.log('Setting role and email for the user...');
      await setDoc(
        doc(db, 'users', user.uid),
        {
          role: 'user', // Default role
          email: user.email, // User's email
        },
        { merge: true } // Merge fields instead of overwriting
      );
      console.log('Role and email set successfully in Firestore.');
    } catch (error) {
      console.error('Error setting role and email:', error);
    }
  };

  return (
    <>
      <Navbar />
      <main className="p-4">
        <h1 className="text-2xl font-bold mb-4">Choose Your Preferences</h1>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Categories</h2>
          <div className="flex flex-col space-y-2">
            {['Arts & Sciences', 'Business', 'Engineering'].map((category) => (
              <label key={category} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={category}
                  checked={categories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                />
                <span>{category}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Weekly Top 5</h2>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={weeklyTop5}
              onChange={(e) => setWeeklyTop5(e.target.checked)}
            />
            <span>
              Sign up for 5 stories curated for you specifically (reminder by
              email)
            </span>
          </label>
        </div>
        <button
          onClick={handleSavePreferences}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save Preferences
        </button>
        {/* Invisible button to set role and email */}
        <button
          ref={hiddenButtonRef}
          onClick={handleSetRoleAndEmail}
          style={{ display: 'none' }} // Make the button invisible
        >
          Set Role and Email
        </button>
      </main>
    </>
  );
}