'use client';

import Navbar from '@/components/navbar'; // Import Navbar

export default function ForYouPage() {
  return (
    <>
      <Navbar /> {/* Navbar is included here */}
      <main className="p-4">
        <h1 className="text-2xl font-bold mb-4">For You</h1>
        <p className="text-gray-600">This is the "For You" page.</p>
      </main>
    </>
  );
}