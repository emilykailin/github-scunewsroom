'use client';

import Navbar from '@/components/navbar';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function PostPage() {
  return (
    <ProtectedRoute>
      <Navbar />
      <main className="p-4">
        <h1 className="text-2xl font-bold mb-4">Create a Post</h1>
        <p>This is the admin-only page for creating posts.</p>
      </main>
    </ProtectedRoute>
  );
}