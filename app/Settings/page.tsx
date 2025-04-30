'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../firebase';
import Navbar from '@/components/navbar';
import ProtectedRoute from '@/components/ProtectedRoute'; // Import ProtectedRoute

export default function SettingsPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [weeklyTop5, setWeeklyTop5] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchPreferences = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setCategories(data.categories || []);
          setWeeklyTop5(data.weeklyTop5 || false);
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      }
    };

    fetchPreferences();
  }, []);

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
      await setDoc(doc(db, 'users', user.uid), {
        categories,
        weeklyTop5,
      });
      alert('Preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const handleRequestAdminAccess = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await updateDoc(doc(db, 'users', user.uid), { adminRequest: true });
      alert('Admin access request sent!');
    } catch (error) {
      console.error('Error requesting admin access:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth); // Log out the user
      router.push('/LogIn'); // Redirect to the login page
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <ProtectedRoute>
      <Navbar /> {/* Add Navbar here */}
      <main className="max-w-7xl mx-auto px-4 py-10 bg-white min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Categories</h2>
          <div className="flex flex-col space-y-2">
            {['Arts & Sciences', 'Business', 'Engineering', 'Art History', 'On-Campus Housing', 'Into The Wild', 'Club Sports', 'Athletics', 'Preforming Arts', 'SCAPP', 'ASG', 'APB'].map((category) => (
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
          className="bg-yellow-400 hover:bg-gray-400 text-white px-4 py-2 mr-4 rounded cursor-pointer"
        >
          Save Preferences
        </button>
        <button
          onClick={handleRequestAdminAccess}
          className="bg-red-600 hover:bg-red-400 text-white px-4 py-2 rounded mb-4 mr-4 cursor-pointer"
        >
          Request Admin Access
        </button>
        <button
          onClick={handleLogout}
          className="bg-gray-600 hover:bg-gray-400 cursor-pointer text-white px-4 py-2 rounded"
        >
          Log Out
        </button>
      </main>
    </ProtectedRoute>
  );
}