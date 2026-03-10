// Service to fetch events from Firestore.

import {db} from "../firebase/firestore";
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from "firebase/firestore";

// Save the attempt at the given userId
// userId = authenticated user ID
// attemptData = data to store 
export async function saveAttempt(userId, attemptData) {
    const ref = collection(db, "users", userId, "attempts");
    const doc = {
        ...attemptData,
        timestamp: serverTimestamp(),
    };
    return await addDoc(ref, doc);
}

// Get the recent attempts of a user
// userId = authenticated user ID
// limitCount = [optional] query count
export async function getRecentAttempts(userId, limitCount = 10) {
    const ref = collection(db, "users", userId, "attempts");
    const q = query(ref, orderBy("timestamp", "desc"), limit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}