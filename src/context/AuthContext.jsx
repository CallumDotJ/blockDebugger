import React from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, signInWithGoogle, signOutUser } from "../firebase/auth";

const AuthCtx = React.createContext(null); // create react context to store the auth

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => { // listen for auth state changes
    const unsub = onAuthStateChanged(auth, (u) => { // callback for when auth state changes
      setUser(u || null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut: signOutUser,
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>; // provide auth state and functions to children components // Auth.Ctx context provided.
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthContext() {
  const ctx = React.useContext(AuthCtx);  // grab the context from within the tree
  if (!ctx) throw new Error("useAuthContext must be used inside <AuthProvider />");
  return ctx;
}
