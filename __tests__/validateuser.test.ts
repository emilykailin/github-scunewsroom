import { handleGoogleLogin } from '../utils/handleGoogleLogin';
import { signInWithPopup, signOut } from 'firebase/auth';
import { getDoc, doc, setDoc } from 'firebase/firestore';

jest.mock('firebase/auth');
jest.mock('firebase/firestore');

// Mock dependencies
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockSetError = jest.fn();
const auth = {}; // dummy auth object
const provider = {}; // dummy provider object
const db = {}; // dummy db object

describe('handleGoogleLogin - user email validation', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    test('rejects non-scu.edu email (gmail)', async () => {
      (signInWithPopup as jest.Mock).mockResolvedValue({
        user: { email: 'user@gmail.com', uid: '123' },
      });
      await handleGoogleLogin({ auth, provider, db, setError: mockSetError, router: { push: mockPush } });
      expect(signOut).toHaveBeenCalled();
      expect(mockSetError).toHaveBeenCalledWith('You must use an email ending with @scu.edu.');
    });
  
    test('rejects non-scu.edu email (other .edu)', async () => {
      (signInWithPopup as jest.Mock).mockResolvedValue({
        user: { email: 'user@berkeley.edu', uid: '123' },
      });
      await handleGoogleLogin({ auth, provider, db, setError: mockSetError, router: { push: mockPush } });
      expect(signOut).toHaveBeenCalled();
      expect(mockSetError).toHaveBeenCalledWith('You must use an email ending with @scu.edu.');
    });
  
    test('rejects malformed email', async () => {
      (signInWithPopup as jest.Mock).mockResolvedValue({
        user: { email: 'not-an-email', uid: '123' },
      });
      await handleGoogleLogin({ auth, provider, db, setError: mockSetError, router: { push: mockPush } });
      expect(signOut).toHaveBeenCalled();
      expect(mockSetError).toHaveBeenCalledWith('You must use an email ending with @scu.edu.');
    });
  
    test('rejects empty email', async () => {
      (signInWithPopup as jest.Mock).mockResolvedValue({
        user: { email: '', uid: '123' },
      });
      await handleGoogleLogin({ auth, provider, db, setError: mockSetError, router: { push: mockPush } });
      expect(signOut).toHaveBeenCalled();
      expect(mockSetError).toHaveBeenCalledWith('You must use an email ending with @scu.edu.');
    });
  
    test('rejects @scu.com (not .edu)', async () => {
      (signInWithPopup as jest.Mock).mockResolvedValue({
        user: { email: 'user@scu.com', uid: '123' },
      });
      await handleGoogleLogin({ auth, provider, db, setError: mockSetError, router: { push: mockPush } });
      expect(signOut).toHaveBeenCalled();
      expect(mockSetError).toHaveBeenCalledWith('You must use an email ending with @scu.edu.');
    });
  });
  
