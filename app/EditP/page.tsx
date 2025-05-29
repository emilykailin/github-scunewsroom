'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../../firebase'; // Import auth here
import Navbar from '@/components/navbar';
import EditPContent from './EditPContent';

export const dynamic = 'force-dynamic'; // Disable static export for this page

export default function EditPPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div>Loading post editor...</div>}>
        <EditPContent />
      </Suspense>
    </ProtectedRoute>
  );
}