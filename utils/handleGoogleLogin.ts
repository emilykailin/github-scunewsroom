import { signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const handleGoogleLogin = async ({
  auth,
  provider,
  db,
  setError,
  router,
}: {
  auth: any;
  provider: any;
  db: any;
  setError: (msg: string) => void;
  router: { push: (path: string) => void };
}) => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    if (user.email && user.email.endsWith('@scu.edu')) {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(
          userDocRef,
          {
            role: 'user',
            email: user.email,
            adminRequest: false,
            categories: [],
            weeklyTop5: false,
          },
          { merge: true }
        );
      }

      router.push('/Preferences');
    } else {
      await signOut(auth);
      setError('You must use an email ending with @scu.edu.');
    }
  } catch (error) {
    console.error('Login error:', error);
    setError('An error occurred during login. Please try again.');
  }
};
