//this is temporary, I couldn't find a sign up page already made
//delete this (folder) if someone makes a sign up page!! i'm testing firebase

'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save extra user info to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        createdAt: new Date().toISOString(),
      });

      setSuccess('Account created and saved to Firestore!');
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: 'auto' }}>
      <h1>Sign Up</h1>
      <form onSubmit={handleSignup}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
        />
        <input
          type="password"
          placeholder="Password (6+ characters)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>
          Create Account
        </button>
      </form>
      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
      {success && <p style={{ color: 'green', marginTop: '1rem' }}>{success}</p>}
    </div>
  );
}
