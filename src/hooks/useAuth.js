// Auth Wrapper for using as hook in main pages.

import { useAuthContext } from "../context/AuthContext";
export const useAuth = () => useAuthContext();
