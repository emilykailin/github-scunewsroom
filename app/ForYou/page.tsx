'use client';

import Navbar from '@/components/navbar';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ForYouPage() {
  return (
    <ProtectedRoute>
      <Navbar />
      <main className="p-4">
        <h1 className="text-2xl font-bold mb-4">For You</h1>
        <p className="text-gray-600">This is the "For You" page.</p>
      </main>
    </ProtectedRoute>
  );
}