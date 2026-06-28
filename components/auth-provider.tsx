"use client";

import {
  User,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  doc,
  onSnapshot,
} from "firebase/firestore";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { isAdminEmail } from "@/lib/admin-access";
import { auth, db } from "@/lib/firebase";
import { UserProfile } from "@/lib/types";

type AuthContextValue = {
  isAdmin: boolean;
  loading: boolean;
  profile: UserProfile | null;
  user: User | null;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cleanupProfile: () => void = () => {};

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      cleanupProfile();
      setUser(nextUser);
      setProfile(null);

      if (!nextUser) {
        setLoading(false);
        return;
      }

      cleanupProfile = onSnapshot(
        doc(db, "users", nextUser.uid),
        (snapshot) => {
          setProfile(snapshot.exists() ? (snapshot.data() as UserProfile) : null);
          setLoading(false);
        },
        () => {
          setProfile(null);
          setLoading(false);
        },
      );
    });

    return () => {
      cleanupProfile();
      unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAdmin: isAdminEmail(
        user?.email,
        process.env.NEXT_PUBLIC_ADMIN_EMAILS,
      ),
      loading,
      profile,
      user,
      signOutUser: () => signOut(auth),
    }),
    [loading, profile, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
