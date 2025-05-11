'use client';

import Navbar from '@/components/navbar';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ForYouPage() {
  return (
    <ProtectedRoute>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-10 bg-white min-h-screen">
        <h1 className="text-4xl text-black font-bold mb-4">For You</h1>
        <p className="text-gray-600">This is the "For You" page.</p>
      </main>
    </ProtectedRoute>
  );
}