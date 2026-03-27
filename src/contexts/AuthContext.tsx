import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import {
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithPopup,
  signOut,
  updatePassword,
  updateProfile as updateFirebaseProfile,
} from "firebase/auth";
import { auth, googleProvider, initAnalytics } from "@/lib/firebase";

interface AuthContextType {
  isAuthenticated: boolean;
  user: { name: string; email: string } | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  getLastGoogleSignInErrorCode: () => string | undefined;
  updateProfile: (name: string, email: string) => Promise<{ ok: boolean; message?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

const clearSessionKeys = () => {
  localStorage.removeItem("zentrov_auth");
  localStorage.removeItem("zentrov_user");
  localStorage.removeItem("zentrov_auth_provider");
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const lastGoogleSignInErrorCodeRef = useRef<string | undefined>(undefined);
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem("zentrov_auth") === "true");
  const [user, setUser] = useState<{ name: string; email: string } | null>(() => {
    const stored = localStorage.getItem("zentrov_user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    void initAnalytics();
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const name = fbUser.displayName?.trim() || fbUser.email?.split("@")[0] || "User";
        const email = fbUser.email ?? "";
        const userData = { name, email };
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem("zentrov_auth", "true");
        localStorage.setItem("zentrov_user", JSON.stringify(userData));
        localStorage.setItem("zentrov_auth_provider", "firebase");
        return;
      }

      if (localStorage.getItem("zentrov_auth_provider") === "firebase") {
        clearSessionKeys();
        setIsAuthenticated(false);
        setUser(null);
      }
    });

    return () => unsub();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 800));

    const usersRaw = localStorage.getItem("zentrov_users");
    const users: Array<{ name: string; email: string; password: string }> = usersRaw ? JSON.parse(usersRaw) : [];
    const matchedUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (users.length > 0 && !matchedUser) {
      return false;
    }

    const userData = { name: matchedUser?.name ?? email.split("@")[0], email };
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem("zentrov_auth", "true");
    localStorage.setItem("zentrov_user", JSON.stringify(userData));
    localStorage.setItem("zentrov_auth_provider", "local");
    return true;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    lastGoogleSignInErrorCodeRef.current = undefined;
    try {
      await signInWithPopup(auth, googleProvider);
      return true;
    } catch (e: unknown) {
      const firebaseCode =
        e && typeof e === "object" && "code" in e && typeof (e as { code: unknown }).code === "string"
          ? (e as { code: string }).code
          : undefined;
      lastGoogleSignInErrorCodeRef.current = firebaseCode;
      return false;
    }
  }, []);

  const getLastGoogleSignInErrorCode = useCallback(() => lastGoogleSignInErrorCodeRef.current, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 800));
    const usersRaw = localStorage.getItem("zentrov_users");
    const users: Array<{ name: string; email: string; password: string }> = usersRaw ? JSON.parse(usersRaw) : [];
    const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) return false;

    const nextUsers = [...users, { name, email, password }];
    localStorage.setItem("zentrov_users", JSON.stringify(nextUsers));

    const userData = { name, email };
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem("zentrov_auth", "true");
    localStorage.setItem("zentrov_user", JSON.stringify(userData));
    localStorage.setItem("zentrov_auth_provider", "local");
    return true;
  }, []);

  const updateProfile = useCallback(async (name: string, email: string) => {
    if (!user) return { ok: false, message: "No active user session." };

    const nextName = name.trim();
    const nextEmail = email.trim().toLowerCase();
    if (!nextName || !nextEmail) return { ok: false, message: "Name and email are required." };

    const usersRaw = localStorage.getItem("zentrov_users");
    const users: Array<{ name: string; email: string; password: string }> = usersRaw ? JSON.parse(usersRaw) : [];
    const isLocalProvider = localStorage.getItem("zentrov_auth_provider") === "local";
    const isFirebaseProvider = localStorage.getItem("zentrov_auth_provider") === "firebase";

    if (isLocalProvider) {
      const hasEmailConflict = users.some(
        (u) => u.email.toLowerCase() === nextEmail && u.email.toLowerCase() !== user.email.toLowerCase(),
      );
      if (hasEmailConflict) return { ok: false, message: "Another account already uses that email." };

      if (users.length > 0) {
        const updatedUsers = users.map((u) => (
          u.email.toLowerCase() === user.email.toLowerCase()
            ? { ...u, name: nextName, email: nextEmail }
            : u
        ));
        localStorage.setItem("zentrov_users", JSON.stringify(updatedUsers));
      }
    } else if (isFirebaseProvider) {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          await updateFirebaseProfile(currentUser, { displayName: nextName });
        } catch {
          return { ok: false, message: "Unable to update Firebase profile right now." };
        }
      }

      if (nextEmail !== user.email.toLowerCase()) {
        return { ok: false, message: "Email change is disabled for Firebase accounts in this panel." };
      }
    }

    const updatedUser = { name: nextName, email: nextEmail };
    setUser(updatedUser);
    localStorage.setItem("zentrov_user", JSON.stringify(updatedUser));
    return { ok: true };
  }, [user]);

  const changePassword = useCallback(async (currentPassword: string, nextPassword: string) => {
    const provider = localStorage.getItem("zentrov_auth_provider");
    const trimmedCurrent = currentPassword.trim();
    const trimmedNext = nextPassword.trim();

    if (!trimmedCurrent || !trimmedNext) {
      return { ok: false, message: "Enter both current and new password." };
    }
    if (trimmedNext.length < 8) {
      return { ok: false, message: "New password must be at least 8 characters." };
    }

    if (provider === "local") {
      if (!user) return { ok: false, message: "No active user session." };
      const usersRaw = localStorage.getItem("zentrov_users");
      const users: Array<{ name: string; email: string; password: string }> = usersRaw ? JSON.parse(usersRaw) : [];
      let updated = false;
      const nextUsers = users.map((u) => {
        if (u.email.toLowerCase() !== user.email.toLowerCase()) return u;
        if (u.password !== trimmedCurrent) return u;
        updated = true;
        return { ...u, password: trimmedNext };
      });
      if (!updated) return { ok: false, message: "Current password is incorrect." };
      localStorage.setItem("zentrov_users", JSON.stringify(nextUsers));
      return { ok: true };
    }

    if (provider === "firebase") {
      const currentUser = auth.currentUser;
      const email = currentUser?.email;
      if (!currentUser || !email) return { ok: false, message: "No Firebase user session found." };

      const isGoogleOnly = currentUser.providerData.some((p) => p.providerId === "google.com")
        && !currentUser.providerData.some((p) => p.providerId === "password");
      if (isGoogleOnly) {
        return { ok: false, message: "Google-only accounts do not support password changes here." };
      }

      try {
        const credential = EmailAuthProvider.credential(email, trimmedCurrent);
        await reauthenticateWithCredential(currentUser, credential);
        await updatePassword(currentUser, trimmedNext);
        return { ok: true };
      } catch {
        return { ok: false, message: "Password update failed. Verify current password and try again." };
      }
    }

    return { ok: false, message: "Unknown authentication provider." };
  }, [user]);

  const logout = useCallback(() => {
    void (async () => {
      try {
        if (localStorage.getItem("zentrov_auth_provider") === "firebase") {
          await signOut(auth);
        }
      } catch {
        /* ignore */
      } finally {
        setIsAuthenticated(false);
        setUser(null);
        clearSessionKeys();
      }
    })();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        signup,
        loginWithGoogle,
        getLastGoogleSignInErrorCode,
        updateProfile,
        changePassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
