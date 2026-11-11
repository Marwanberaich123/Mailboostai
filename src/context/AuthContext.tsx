import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signOut,
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
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Sync profile from Firestore or create initial user document
  const syncUserProfile = async (firebaseUser: User) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const snapshot = await getDoc(userRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        setUserProfile({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: data.displayName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'مستخدم بوست ريتش',
          photoURL: data.photoURL || firebaseUser.photoURL || undefined,
          plan: 'unlimited',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        // Update last login
        await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });
      } else {
        const initialProfile: UserProfile = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'مستخدم بوست ريتش',
          photoURL: firebaseUser.photoURL || undefined,
          plan: 'unlimited',
          createdAt: new Date().toISOString(),
        };

        await setDoc(userRef, {
          ...initialProfile,
          serverCreated: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        });
        setUserProfile(initialProfile);
      }
    } catch (err: any) {
      console.warn('Could not sync profile with Firestore:', err.message);
      setUserProfile({
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'مستخدم بوست ريتش',
        photoURL: firebaseUser.photoURL || undefined,
        plan: 'unlimited',
        createdAt: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
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
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleAuthProvider);
      await syncUserProfile(result.user);
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      if (err.code === 'auth/popup-blocked') {
        setError('تم حظر النافذة المنبثقة من قبل متصفحك. يرجى السماح بالنوافذ المنبثقة (Popups) ثم المحاولة مجدداً.');
      } else if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user') {
        setError('تم إلغاء نافذة تسجيل الدخول عبر Google قبل اكتمالها.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('النطاق الحالي غير مصرح له في إعدادات Firebase Auth. يرجى التأكد من إضافة النطاق في لوحة تحكم Firebase.');
      } else {
        setError(err.message || 'فشل تسجيل الدخول عبر حساب Google.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (err: any) {
      console.error('Logout Error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isDemoMode: false,
        error,
        clearError,
        signInWithGoogle,
        logout,
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
