'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase'; // Use centralized Firebase initialization
import ProtectedRoute from '@/components/ProtectedRoute';
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

      // Redirect to the Newsroom page
      router.push('/Newsroom');
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
    <ProtectedRoute>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-10 bg-white min-h-screen">
        <h1 className="text-4xl text-black font-bold mb-4">Choose Your Preferences</h1>
        <div className="mb-4 text-black">
          <h2 className="text-lg font-light">Pick at least three topics you are interested in at Santa Clara to help us curate your For You page.</h2>
          <div className="flex flex-wrap gap-2 pt-4">
              {['Arts & Sciences', 'Business', 'Engineering', 'Art History', 'On-Campus Housing', 'Into The Wild', 'Club Sports', 'Athletics', 'Performing Arts', 'SCCAP', 'ASG', 'APB'].map((category) => {
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
        <div className="mb-4 text-black">
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
          className="bg-yellow-400 hover:bg-gray-400 text-white px-4 py-2 rounded cursor-pointer"
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
    </ProtectedRoute>
  );
}