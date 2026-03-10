import { useAuth } from "../hooks/useAuth";

export default function Login() {
  /* States */

  // states from useAuth stored.
  const { user, signInWithGoogle, signOut, loading } = useAuth();

  // Loading State

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-white">
        <p className="text-slate-400">Checking authentication...</p>
      </div>
    );
  }

  // Main Page

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-white">
          {user ? "Your Account" : "Sign In"}
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          {user
            ? "Manage your session below."
            : "Sign in to save your debug history and track learning progress."}
        </p>

        {user ? (
          <>
            <div className="mt-6 p-4 bg-slate-800 rounded-lg">
              <p className="text-sm text-slate-400">Signed in as</p>
              <p className="text-white font-medium break-all">{user.email}</p>
            </div>

            <button
              onClick={signOut}
              className="mt-6 w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-700 transition-colors text-white font-medium"
            >
              Sign Out
            </button>
          </>
        ) : (
          <button
            onClick={signInWithGoogle}
            className="mt-6 w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 transition-colors text-slate-900 font-semibold"
          >
            Continue with Google
          </button>
        )}
      </div>
    </div>
  );
}
