import { getFirestore, collection } from "firebase/firestore";
import { app } from "./app";

export const db = getFirestore(app);

// base collections of attempts
export const usersCol = collection(db, "users");
