'use client';

import Navbar from '@/components/navbar'; // Import Navbar

export default function FavoritesPage() {
  return (
    <>
      <Navbar /> {/* Navbar is included here */}
      <main className="p-4">
        <h1 className="text-2xl font-bold mb-4">Favorites</h1>
        <p className="text-gray-600">This is the "Favorites" page.</p>
      </main>
    </>
  );
}