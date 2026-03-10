import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { app } from "./app";

// AUTH STATE
export const auth = getAuth(app); // auth stored within teh app
export const googleProvider = new GoogleAuthProvider(); // creates google token when signed in

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider); // wrapper function for signing in
export const signOutUser = () => signOut(auth); // wrapper function for signing out the user
