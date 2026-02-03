import React from "react";
import { Link } from "react-router-dom";
import Section from "../components/Section";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Top bar */}
        <div className="mb-10 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-900">Block Debug Tutor</div>
          <Link 
            to="/debug"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
          >
            Open Debugger
          </Link>
        </div>

        {/* Simple hero */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Debug block-based projects with step-by-step hints
          </h1>

          <p className="mt-3 text-base text-slate-600">
            Upload a screenshot of your blocks. Get a clear summary, assumptions, issues with evidence,
            pseudocode, and progressive hint to help you fix the program.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/debug"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              Start Debugging
            </Link>

            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              How it works
            </a>
          </div>

          {/* Mini highlights */}
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Output</div>
              <div className="mt-1 text-sm font-medium text-slate-900">Strict JSON</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Explain</div>
              <div className="mt-1 text-sm font-medium text-slate-900">Pseudocode</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Learn</div>
              <div className="mt-1 text-sm font-medium text-slate-900">Hints 1 → 3</div>
            </div>
          </div>
        </div>

        {/*how it works */}
        <div id="how-it-works" className="mt-10">
          <Section title="How it works" subtitle="Simple workflow, focused on learning.">
            <ol className="space-y-3 text-sm text-slate-700">
              <li>
                <span className="font-semibold text-slate-900">1) Upload a screenshot</span>
                <div className="mt-1 text-slate-600">
                  Use a clear image showing the full script area.
                </div>
              </li>
              <li>
                <span className="font-semibold text-slate-900">2) Read the structured feedback</span>
                <div className="mt-1 text-slate-600">
                  Summary, assumptions, issues, evidence, and pseudocode.
                </div>
              </li>
              <li>
                <span className="font-semibold text-slate-900">3) Reveal hints gradually</span>
                <div className="mt-1 text-slate-600">
                  Hint 1 is light guidance, Hint 2 is clearer, Hint 3 is near-solution.
                </div>
              </li> 
            </ol>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/debug"
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                Try it now
              </Link>
              <div className="text-sm text-slate-600">
                Tip: If output seems off, crop tighter around the blocks and re-upload.
              </div>
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-600">
          Block Debug Tutor — built for block-based debugging and learning.
        </div>
      </div>
    </div>
  );
}
