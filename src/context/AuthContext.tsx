import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleAuthProvider } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isDemoMode: boolean;
  error: string | null;
  clearError: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  enterDemoMode: () => void;
}

const OWNER_USER_PROFILE: UserProfile = {
  id: 'owner_user_postreach',
  email: 'admin@postreach.io',
  displayName: 'المالك',
  plan: 'unlimited',
  createdAt: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem('postreach_demo_mode') === 'true';
  });
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Sync profile from Firestore or create initial doc
  const syncUserProfile = async (firebaseUser: User) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const snapshot = await getDoc(userRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        setUserProfile({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: data.displayName || firebaseUser.displayName || 'المالك',
          photoURL: data.photoURL || firebaseUser.photoURL || undefined,
          plan: 'unlimited',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt,
        });
      } else {
        const initialProfile: UserProfile = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'المالك',
          photoURL: firebaseUser.photoURL || undefined,
          plan: 'unlimited',
          createdAt: new Date().toISOString(),
        };

        await setDoc(userRef, {
          ...initialProfile,
          serverCreated: serverTimestamp(),
        });
        setUserProfile(initialProfile);
      }
    } catch (err: any) {
      console.warn('Could not sync profile with Firestore:', err.message);
      setUserProfile({
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'المالك',
        photoURL: firebaseUser.photoURL || undefined,
        plan: 'unlimited',
        createdAt: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    if (isDemoMode) {
      setUserProfile(OWNER_USER_PROFILE);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncUserProfile(currentUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isDemoMode]);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleAuthProvider);
      setIsDemoMode(false);
      localStorage.removeItem('postreach_demo_mode');
      await syncUserProfile(result.user);
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      if (err.code === 'auth/popup-blocked') {
        setError('تم حظر النافذة المنبثقة من قبل متصفحك. يرجى السماح بالنوافذ المنبثقة ثم المحاولة مجدداً.');
      } else if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user') {
        setError('تم إلغاء عملية تسجيل الدخول قبل اكتمالها.');
      } else {
        setError(err.message || 'فشل تسجيل الدخول عبر حساب Google.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setError(null);
    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, pass);
      setIsDemoMode(false);
      localStorage.removeItem('postreach_demo_mode');
      await syncUserProfile(result.user);
    } catch (err: any) {
      console.error('Email Sign In Error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التحقق من البيانات.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('تم حظر المحاولات مؤقتاً لكثرة المحاولات الخاطئة. يرجى إعادة تعيين كلمة المرور.');
      } else {
        setError(err.message || 'فشل تسجيل الدخول.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    setError(null);
    try {
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      if (name) {
        await updateProfile(result.user, { displayName: name });
      }
      setIsDemoMode(false);
      localStorage.removeItem('postreach_demo_mode');
      await syncUserProfile(result.user);
    } catch (err: any) {
      console.error('Sign Up Error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('يوجد حساب مسجل بالفعل بهذا البريد الإلكتروني. يرجى تسجيل الدخول.');
      } else if (err.code === 'auth/weak-password') {
        setError('يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.');
      } else {
        setError(err.message || 'فشل إنشاء الحساب.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      console.error('Password Reset Error:', err);
      setError(err.message || 'فشل إرسال بريد استعادة كلمة المرور.');
      throw err;
    }
  };

  const logout = async () => {
    try {
      if (isDemoMode) {
        setIsDemoMode(false);
        localStorage.removeItem('postreach_demo_mode');
        setUserProfile(null);
      } else {
        await signOut(auth);
      }
      setUser(null);
      setUserProfile(null);
    } catch (err: any) {
      console.error('Logout Error:', err);
    }
  };

  const enterDemoMode = () => {
    setIsDemoMode(true);
    localStorage.setItem('postreach_demo_mode', 'true');
    setUser(null);
    setUserProfile(OWNER_USER_PROFILE);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isDemoMode,
        error,
        clearError,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        logout,
        enterDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
