import { getRecentAttempts } from "../services/attemptService";
import { useAuth } from "../hooks/useAuth";
import React from "react";
import { Link } from "react-router-dom";

// Analytics page for past conversation

export default function Analytics() {

  // States // 
  const { user } = useAuth(); // use state from useAuth
  const [attempts, setAttempts] = React.useState([]); // fetched attempts store


  // EFFECT = if logged in fetch attempts.
  React.useEffect(() => {
    if (user) {
      getRecentAttempts(user.uid).then(setAttempts);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Top bar */}
        <div className="mb-10 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-900">
            Block Debug Tutor
          </div>

          <Link
            to="/debug"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
          >
            Open Debugger
          </Link>
        </div>

        {/* Hero Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Analytics
          </h1>

          <p className="mt-3 text-base text-slate-600">
            View your learning insights and track debugging progress over time.
          </p>

          {/* Summary Tiles */}
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Attempts
              </div>
              <div className="mt-1 text-sm font-medium text-slate-900">
                {attempts.length}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Status
              </div>
              <div className="mt-1 text-sm font-medium text-slate-900">
                {user ? "Signed In" : "Not Signed In"}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Insight
              </div>
              <div className="mt-1 text-sm font-medium text-slate-900">
                Recent Attempts
              </div>
            </div>
          </div>
        </div>

        {/* Attempts Section */}
        <div className="mt-10">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Recent Attempts
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              Your latest debugging summaries and detected issues.
            </p>

            {attempts.length > 0 ? (
              <div className="mt-6 space-y-4">
                {attempts.map((attempt, index) => (
                  <div
                    key={attempt.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-slate-900">
                        Attempt {index + 1}
                      </div>
                      <div className="text-xs text-slate-500">
                        Confidence:{" "}
                        {attempt.confidence !== null
                          ? `${attempt.confidence * 100}%` 
                          : "N/A"}
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-slate-700">
                      <span className="font-medium text-slate-900">
                        Summary:
                      </span>{" "}
                      {attempt.summary}
                    </div>

                    <div className="mt-3 text-sm text-slate-700">
                      <span className="font-medium text-slate-900">
                        Identified Issues:
                      </span>{" "}
                      {attempt.identifiedIssues.length > 0
                        ? attempt.identifiedIssues
                            .map((i) => i.title)
                            .join(", ")
                        : "None"}
                    </div>

                    <div className="mt-3 text-sm text-slate-700">
                      <span className="font-medium text-slate-900">
                        Common Mistakes to Avoid:
                      </span>{" "}
                      {attempt.commonMistakesToAvoid.length > 0
                        ? attempt.commonMistakesToAvoid.join(", ")
                        : "None"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                No attempts found. Start debugging to see your progress here!
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-600">
          Block Debug Tutor — track patterns, improve faster.
        </div>
      </div>
    </div>
  );
}
