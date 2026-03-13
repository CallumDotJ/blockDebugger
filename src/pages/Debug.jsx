import React from "react";
//import { jsonrepair } from "jsonrepair";

// Importing components
import ImageUploader from "../components/ImageUploader";
import Badge from "../components/Badge";
import SeverityBadge from "../components/SeverityBadge";
import Section from "../components/Section";
import Skeleton from "../components/Skeleton";
import BlockPreview from "../components/BlockPreview";

// firestore

import { saveAttempt } from "../services/attemptService";
import { useAuth } from "../hooks/useAuth";

//////////////////////////
// Main Debugging Page //
/////////////////////////

export default function Debug() {
  /* STATES */
  ///////////////////////////////////////////////////////////////

  const [image, setImage] = React.useState(null); //File object
  const [previewUrl, setPreviewUrl] = React.useState(""); // for image preview
  const [loading, setLoading] = React.useState(false); // loading state
  const [apiError, setApiError] = React.useState(""); // error states
  const [result, setResult] = React.useState(null); // the parsed JSON object
  const [raw, setRaw] = React.useState(""); // in case API returns raw string
  const [warning, setWarning] = React.useState(""); // model output warning message -
  const [notes, setNotes] = React.useState(""); // notes
  const [needsReset, setNeedsReset] = React.useState(false); // if true page and states requires reset before allowing analysis
  const [platform, setPlatform] = React.useState("edublocks"); // block platform
  // platform = 'scratch' | 'blockly' | 'edublocks' - for colour coding

  // sequential hints
  const [hintStep, setHintStep] = React.useState(0); // 0 = none, 1 to 3 reveal levels
  const maxHintStep = 3; // from 1

  // platform types
  const platformTypes = ["Edublocks", "Scratch", "Blockly"];

  // auth
  const { user } = useAuth();

  ////////////////////////////////////////////////////////////////

  // EFFECT = If image now exists, create the objectURL.
  React.useEffect(() => {
    if (!image) return;
    const url = URL.createObjectURL(image);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  // Handles file onSelect - sets states reset if new image.

  const handleImageSelect = (file) => {
    // perform resets on new image upload, then fetch
    setImage(file);
    setResult(null);
    setRaw("");
    setWarning("");
    setApiError("");
    setHintStep(0);
    setNeedsReset(false);
  };

  // platform select handler
  const handlePlatformSelect = (e) => {
    const selectedPlatform = e.target.value.toLowerCase();
    setPlatform(selectedPlatform);
  };
  // Hanldes fetch of data onClick from analyse button, enables needsReset.
  // file = file/image to send
  const handleFetch = (file) => {
    fetchDebugData(file);
    setNeedsReset(true);
  };

  // Main Fetch Function
  // file = file/image to send
  const fetchDebugData = async (file) => {
    // Fetch Source URL - Modular for scalability ie VM and AWS etc.
    const fetchURL = "http://localhost:5000/api/openai/debug";

    try {
      // Temp State setting
      setLoading(true);
      setApiError("");

      const formData = new FormData();
      formData.append("notes", notes); // add notes from state.
      formData.append("image", file); // add file from param.

      // Fetch async
      const response = await fetch(fetchURL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json(); // json format

      // guard against non - 200 responses

      if (!response.ok) {
        throw new Error(data?.message || "Request failed");
      }

      // Failure/Semi-Failure states
      if (data?.warning) setWarning(data.warning);
      if (data?.raw) setRaw(data.raw);

      // output var
      const out = data?.output;

      // If the model returned an array by mistake, can keep it visible
      if (Array.isArray(out)) {
        setResult({
          summary: "",
          assumptions: [],
          identifiedIssues: [],
          pseudocodeLocation: {},
          hints: [],
          officialAnswer: {},
          _array: out,
        }); // wrap in object
      } else {
        setResult(out || null); // fallback display whole output
      }

      // DEBUG LOGGING
      console.log("Raw API response:", data);

      // LOGIC FOR LEARNING INSIGHTS
      if (user && out) {
        await saveAttempt(user.uid, {
          summary: out.summary || "",
          confidence: out?.issueLocation?.confidence ?? null,
          commonMistakesToAvoid:
            out?.officialAnswer?.commonMistakesToAvoid || [],
          identifiedIssues: (out?.identifiedIssues || []).map((i) => ({
            id: i.id,
            title: i.title,
            severity: i.severity,
          })),
        });
      }
    } catch (err) {
      // Facllback fail API req
      setApiError(err?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // State Resets
  const resetAll = () => {
    setImage(null);
    setPreviewUrl("");
    setLoading(false);
    setApiError("");
    setResult(null);
    setRaw("");
    setWarning("");
    setHintStep(0);
    setNotes("");
    setNeedsReset(false);
  };

  ////////////////
  /* HINT LOGIC */
  ////////////////

  const hints = Array.isArray(result?.hints) ? result.hints : []; // stores hints

  const hintsSorted = hints
    .slice() // shallow copy
    .sort((a, b) => (a?.level ?? 0) - (b?.level ?? 0)) // safe sorting - avoids the crashes before from null param.
    .filter((h) => [1, 2, 3].includes(h?.level)); // only keeps 1,2,3 level.

  const canRevealNextHint = // safe revealing of new hint if applicable
    hintStep < Math.min(maxHintStep, hintsSorted.length || maxHintStep);

  const canHideHints = hintStep > 0; // only hide if need/required/guard overflow

  ///////////////////////////////////

  /////////////////////////
  /* Returned API Stores */
  /* Rebuilding UI BLock Store */

  const issueLocation = result?.issueLocation; // stores issueLocation

  const blockPath = Array.isArray(issueLocation?.blockPath)
    ? issueLocation.blockPath
    : [];

  const previewBlocks = Array.isArray(issueLocation?.blocks)
    ? issueLocation.blocks
    : [];

  const problemBlockId = issueLocation?.problemBlockId || "";

  const confidence =
    typeof issueLocation?.confidence === "number"
      ? issueLocation.confidence
      : null;

  const locationNotes =
    typeof issueLocation?.notes === "string" ? issueLocation.notes : "";

  /////////////////////////

  // Function to export all response as json file
  const exportJson = () => {
    if (!result) return;

    // use blob API object for the data object
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      // 2 = space for pretty formatting.
      type: "application/json",
    });
    const url = URL.createObjectURL(blob); // store
    const a = document.createElement("a"); // create ref to store
    a.href = url;
    a.download = "debug-output.json"; // name
    a.click(); // start download
    URL.revokeObjectURL(url); // remove from m
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Block Debug Tutor
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Upload a screenshot of your Scratch/Blockly blocks and get
              structured issues, pseudocode, and step-by-step hints.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {result && (
              <button
                onClick={exportJson}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Export JSON
              </button>
            )}
            <select
              value={platform}
              onChange={handlePlatformSelect}
              className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
            >
              {platformTypes.map((type) => (
                <option key={type} value={type.toLowerCase()}>
                  {type}
                </option>
              ))}
            </select>
            <button
              onClick={resetAll}
              className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left: uploader + preview */}
          <div className="lg:col-span-5 space-y-6">
            <Section
              title="1) Upload Screenshot"
              right={<Badge tone="blue">Input</Badge>}
            >
              <div className="space-y-4">
                <ImageUploader onFileSelect={handleImageSelect} />

                <p className="text-sm">
                  Hint: If output seems confusing, try uploading a tighter
                  screenshot of the blocks.
                </p>

                {previewUrl ? (
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
                      <div className="text-sm font-medium text-slate-700">
                        Preview
                      </div>
                      {image?.name ? (
                        <div className="text-xs text-slate-500">
                          {image.name}
                        </div>
                      ) : null}
                    </div>
                    <img
                      src={previewUrl}
                      alt="Uploaded blocks"
                      className="max-h-[520px] w-full object-contain bg-slate-50"
                    />
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-300 bg-white px-4 py-10 text-center">
                    <div className="mx-auto max-w-sm">
                      <div className="text-sm font-medium text-slate-900">
                        No screenshot uploaded yet
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        Upload a clear screenshot showing the full script area
                        if possible.
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes section */}
                <div className="pt-4">
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Notes (optional)
                  </label>

                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Example: My sprite should stop when it touches the edge but it keeps moving..."
                    rows={4}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Add any context about what the program is supposed to do.
                    This helps the debugger give better hints.
                  </p>

                  <button
                    onClick={() => handleFetch(image)}
                    disabled={!image || loading || needsReset}
                    className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    {loading ? "Analyzing..." : "Analyze Screenshot"}
                  </button>
                </div>
              </div>
            </Section>

            {/* Status ----- Shows the warning and warnings from apis*/}
            <Section
              title="Status"
              right={
                <Badge tone={loading ? "purple" : "gray"}>
                  {loading ? "Working" : "Idle"}
                </Badge>
              }
            >
              {loading ? (
                <Skeleton />
              ) : apiError ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                  <div className="font-semibold">Request failed</div>
                  <div className="mt-1">{apiError}</div>
                </div>
              ) : warning ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  <div className="font-semibold">Model output warning</div>
                  <div className="mt-1">{warning}</div>
                  {raw ? (
                    <div className="mt-3">
                      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-900">
                        Raw
                      </div>
                      <pre className="max-h-48 overflow-auto rounded-lg bg-white p-3 text-xs text-slate-800 border border-amber-200">
                        {raw}
                      </pre>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="text-sm text-slate-600">
                  Upload a screenshot.
                </div>
              )}
            </Section>
          </div>

          {/* Right - results */}
          <div className="lg:col-span-7 space-y-6">
            <Section
              title="2) Summary"
              right={<Badge tone="green">Output</Badge>}
            >
              {!result ? (
                <div className="text-sm text-slate-600">No output yet.</div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-slate-800">
                    {result?.summary || "No summary returned."}
                  </p>

                  {Array.isArray(result?.assumptions) &&
                  result.assumptions.length > 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="text-sm font-semibold text-slate-900">
                          Assumptions
                        </div>
                        <Badge tone="gray">{result.assumptions.length}</Badge>
                      </div>
                      <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                        {result.assumptions.map((a, idx) => (
                          <li key={idx}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              )}
            </Section>

            <Section
              title="3) Issues Found"
              right={
                result?.identifiedIssues?.length ? (
                  <Badge tone="red">
                    {result.identifiedIssues.length} issues
                  </Badge>
                ) : (
                  <Badge tone="gray">None</Badge>
                )
              }
            >
              {!result ? (
                <div className="text-sm text-slate-600">No output yet.</div>
              ) : Array.isArray(result?.identifiedIssues) &&
                result.identifiedIssues.length > 0 ? (
                <div className="space-y-4">
                  {result.identifiedIssues.map((issue) => (
                    <div
                      key={issue?.id || issue?.title}
                      className="rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-semibold text-slate-900">
                          {issue?.title || "Untitled issue"}
                        </div>
                        <SeverityBadge severity={issue?.severity} />
                        {issue?.id ? (
                          <Badge tone="gray">#{issue.id}</Badge>
                        ) : null}
                      </div>

                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                            Evidence
                          </div>
                          <div className="mt-1 text-sm text-slate-800">
                            {issue?.evidence || "—"}
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                            Why it breaks
                          </div>
                          <div className="mt-1 text-sm text-slate-800">
                            {issue?.whyItBreaks || "—"}
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
                          <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                            Fix
                          </div>
                          <div className="mt-1 text-sm text-slate-800">
                            {issue?.fix || "—"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-600">
                  No issues were returned by the model. If that seems wrong, try
                  a clearer screenshot.
                </div>
              )}
            </Section>

            <Section
              title="4) Where the issue is"
              right={<Badge tone="red">Visual</Badge>}
            >
              {!result ? (
                <div className="text-sm text-slate-600">No output yet.</div>
              ) : (
                <div className="space-y-4">
                  {/* Path chips */}
                  {blockPath.length > 0 ? (
                    <div>
                      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Block path
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {blockPath.map((p, idx) => (
                          <span
                            key={idx}
                            className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-600">
                      No block path returned. (Try a clearer screenshot.)
                    </div>
                  )}

                  {/* Confidence */}
                  {confidence !== null ? (
                    <div className="text-xs text-slate-600">
                      Confidence:{" "}
                      <span className="font-semibold">
                        {Math.round(confidence * 100)}%{" "}
                        {/* convery to ux friendly output */}
                      </span>
                    </div>
                  ) : null}

                  {/* Preview */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Block preview
                    </div>

                    <BlockPreview
                      blocks={previewBlocks}
                      problemBlockId={problemBlockId}
                      platform={platform}
                    />

                    {locationNotes ? (
                      <div className="mt-3 text-xs text-slate-600">
                        Note: {locationNotes}
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </Section>

            <Section
              title="4) Pseudocode Breakdown"
              right={<Badge tone="purple">Explain</Badge>}
            >
              {!result ? (
                <div className="text-sm text-slate-600">No output yet.</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Current behavior
                    </div>
                    <pre className="whitespace-pre-wrap text-sm text-slate-800">
                      {result?.pseudocodeLocation?.currentBehaviorPseudocode ||
                        "-"}
                    </pre>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Where it goes wrong
                    </div>
                    <pre className="whitespace-pre-wrap text-sm text-slate-800">
                      {result?.pseudocodeLocation?.whereItGoesWrong || "-"}
                    </pre>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Corrected logic
                    </div>
                    <pre className="whitespace-pre-wrap text-sm text-slate-800">
                      {result?.pseudocodeLocation?.correctedLogicPseudocode ||
                        "-"}
                    </pre>
                  </div>
                </div>
              )}
            </Section>

            {/* Sequential Hint System */}
            <Section
              title="5) Hint System"
              right={
                <div className="flex items-center gap-2">
                  <Badge tone="blue">Sequential</Badge>
                  <Badge tone="gray">
                    Step {hintStep}/
                    {Math.min(maxHintStep, hintsSorted.length || maxHintStep)}
                  </Badge>
                </div>
              }
            >
              {!result ? (
                <div className="text-sm text-slate-600">No output yet.</div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      disabled={!canRevealNextHint}
                      onClick={() =>
                        setHintStep((s) => Math.min(s + 1, maxHintStep))
                      }
                      className={`rounded-xl px-4 py-2 text-sm font-medium shadow-sm ${
                        canRevealNextHint
                          ? "bg-slate-900 text-white hover:bg-slate-800"
                          : "bg-slate-200 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      Reveal next hint
                    </button>

                    <button
                      disabled={!canHideHints}
                      onClick={() => setHintStep(0)}
                      className={`rounded-xl border px-4 py-2 text-sm font-medium shadow-sm ${
                        canHideHints
                          ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          : "border-slate-200 bg-white text-slate-300 cursor-not-allowed"
                      }`}
                    >
                      Hide hints
                    </button>

                    <div className="text-sm text-slate-600">
                      Reveal hints one-by-one. Try to fix before revealing the
                      next.
                    </div>
                  </div>

                  {/* HINT SYSTEM UI */}
                  <div className="space-y-3">
                    {[1, 2, 3].map((level) => {
                      // map first 3 of tht hints
                      const hintObj = hintsSorted.find(
                        (h) => h.level === level, // use inline to iterate
                      );
                      const visible = hintStep >= level;
                      return (
                        <div
                          key={level}
                          className={`rounded-2xl border ${
                            visible
                              ? "border-slate-200 bg-white"
                              : "border-slate-200 bg-slate-50"
                          } p-4`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <Badge tone={visible ? "blue" : "gray"}>
                                Hint {level}
                              </Badge>
                              {!visible ? (
                                <Badge tone="gray">Locked</Badge>
                              ) : (
                                <Badge tone="green">Revealed</Badge>
                              )}
                            </div>
                          </div>

                          <div className="mt-3 text-sm text-slate-800">
                            {visible ? (
                              hintObj?.hint || "No hint text returned."
                            ) : (
                              <div className="text-slate-500">
                                Reveal this hint to see guidance.
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Section>

            {/* Official Answer Section */}
            <Section
              title="6) Official Answer"
              right={<Badge tone="green">Solution</Badge>}
            >
              {!result ? (
                <div className="text-sm text-slate-600">No output yet.</div>
              ) : hintStep < maxHintStep ? (
                <div className="text-sm text-slate-600">
                  Reveal all hints to unlock the official answer.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Final pseudocode
                      </div>
                    </div>
                    <pre className="whitespace-pre-wrap text-sm text-slate-800">
                      {result?.officialAnswer?.finalPseudocode || "—"}
                    </pre>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Block fix steps
                    </div>
                    {Array.isArray(result?.officialAnswer?.blockFixSteps) ? (
                      <ol className="list-decimal pl-5 text-sm text-slate-800 space-y-1">
                        {result.officialAnswer.blockFixSteps.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ol>
                    ) : (
                      <div className="text-sm text-slate-800">
                        {result?.officialAnswer?.blockFixSteps || "—"}
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Common mistakes to avoid
                    </div>
                    {Array.isArray(
                      result?.officialAnswer?.commonMistakesToAvoid,
                    ) ? (
                      <ul className="list-disc pl-5 text-sm text-slate-800 space-y-1">
                        {result.officialAnswer.commonMistakesToAvoid.map(
                          (m, idx) => (
                            <li key={idx}>{m}</li>
                          ),
                        )}
                      </ul>
                    ) : (
                      <div className="text-sm text-slate-800">
                        {result?.officialAnswer?.commonMistakesToAvoid || "—"}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}
