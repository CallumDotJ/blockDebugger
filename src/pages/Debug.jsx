import React from "react";

// Importing components
import ImageUploader from "../components/ImageUploader";
import Badge from "../components/Badge";
import SeverityBadge from "../components/SeverityBadge";
import Section from "../components/Section";
import Skeleton from "../components/Skeleton";
import BlockPreview from "../components/BlockPreview";


export default function Debug() {
  const [image, setImage] = React.useState(null); //File object //
  const [previewUrl, setPreviewUrl] = React.useState(""); // for image preview
  const [loading, setLoading] = React.useState(false); //
  const [apiError, setApiError] = React.useState("");
  const [result, setResult] = React.useState(null); // the parsed JSON object
  const [raw, setRaw] = React.useState(""); // in case API returns raw string
  const [warning, setWarning] = React.useState(""); // model output warning message - 

  // sequential hints
  const [hintStep, setHintStep] = React.useState(0); // 0 = none, 1 to 3 reveal levels
  const maxHintStep = 3;

  React.useEffect(() => {
    if (!image) return;
    const url = URL.createObjectURL(image);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const handleImageSelect = (file) => { // perform resets on new image upload, then fetch
    setImage(file);
    setResult(null);
    setRaw("");
    setWarning("");
    setApiError("");
    setHintStep(0);
    fetchDebugData(file);
  };

  const fetchDebugData = async (file) => {
    try {
      setLoading(true);
      setApiError("");

      const formData = new FormData();
      formData.append("notes", "test"); // replace with textarea input later if needed
      formData.append("image", file);

      const response = await fetch("http://localhost:5000/api/openai/debug", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

        // guard against non200 responses

      if (!response.ok) {
        throw new Error(data?.message || "Request failed");
      }

      if (data?.warning) setWarning(data.warning);
      if (data?.raw) setRaw(data.raw);

      const out = data?.output;

      if (Array.isArray(out)) { 
        // if the model returned an array by mistake, you can keep it visible
        setResult({ summary: "", assumptions: [], identifiedIssues: [], pseudocodeLocation: {}, hints: [], officialAnswer: {}, _array: out }); // wrap in object
      } else {
        setResult(out || null);
      }
    } catch (err) {
      setApiError(err?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setImage(null);
    setPreviewUrl("");
    setLoading(false);
    setApiError("");
    setResult(null);
    setRaw("");
    setWarning("");
    setHintStep(0);
  };

  const hints = Array.isArray(result?.hints) ? result.hints : [];
  const hintsSorted = hints
    .slice()
    .sort((a, b) => (a?.level ?? 0) - (b?.level ?? 0))
    .filter((h) => [1, 2, 3].includes(h?.level));

  const canRevealNextHint = hintStep < Math.min(maxHintStep, hintsSorted.length || maxHintStep);
  const canHideHints = hintStep > 0;

  const issueLocation = result?.issueLocation;

  const blockPath = Array.isArray(issueLocation?.blockPath)
    ? issueLocation.blockPath 
    : [];
  
  const previewBlocks = Array.isArray(issueLocation?.blocks)
    ? issueLocation.blocks
    : [];

  const problemBlockId = issueLocation?.problemBlockId || "";

  const confidence = 
    typeof issueLocation?.confidence === "number" ? issueLocation.confidence : null;

  const locationNotes = 
    typeof issueLocation?.notes === "string" ? issueLocation.notes : "";

 
  const exportJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "debug-output.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Block Debug Tutor</h1>
            <p className="mt-1 text-sm text-slate-600">
              Upload a screenshot of your Scratch/Blockly blocks and get structured issues, pseudocode, and step-by-step hints.
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

                <p className="text-sm">Hint: If output seems confusing, try uploading a tighter screenshot of the blocks.</p>

                {previewUrl ? (
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
                      <div className="text-sm font-medium text-slate-700">Preview</div>
                      {image?.name ? <div className="text-xs text-slate-500">{image.name}</div> : null}
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
                      <div className="text-sm font-medium text-slate-900">No screenshot uploaded yet</div>
                      <div className="mt-1 text-sm text-slate-600">
                        Upload a clear screenshot showing the full script area if possible.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Section>

            {/* Status ----- Shows the warning and warnings from apis*/}
            <Section title="Status" right={<Badge tone={loading ? "purple" : "gray"}>{loading ? "Working" : "Idle"}</Badge>}>
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
                      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-900">Raw</div>
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
            <Section title="2) Summary" right={<Badge tone="green">Output</Badge>}>
              {!result ? (
                <div className="text-sm text-slate-600">No output yet.</div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-slate-800">
                    {result?.summary || "No summary returned."}
                  </p>

                  {Array.isArray(result?.assumptions) && result.assumptions.length > 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="text-sm font-semibold text-slate-900">Assumptions</div>
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
                  <Badge tone="red">{result.identifiedIssues.length} issues</Badge>
                ) : (
                  <Badge tone="gray">None</Badge>
                )
              }
            >
              {!result ? (
                <div className="text-sm text-slate-600">No output yet.</div>
              ) : Array.isArray(result?.identifiedIssues) && result.identifiedIssues.length > 0 ? (
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
                        {issue?.id ? <Badge tone="gray">#{issue.id}</Badge> : null}
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
                  No issues were returned by the model. If that seems wrong, try a clearer screenshot.
                </div>
              )}
            </Section>

            <Section title="4) Where the issue is" right={<Badge tone="red">Visual</Badge>}>
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
          Confidence: <span className="font-semibold">{Math.round(confidence * 100)}%</span>
        </div>
      ) : null}

      {/* Preview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
          Block preview
        </div>

        <BlockPreview blocks={previewBlocks} problemBlockId={problemBlockId} />

        {locationNotes ? (
          <div className="mt-3 text-xs text-slate-600">
            Note: {locationNotes}
          </div>
        ) : null}
      </div>
    </div>
  )}
            </Section>

            <Section title="Pseudocode Breakdown" right={<Badge tone="purple">Explain</Badge>}>
              {!result ? (
                <div className="text-sm text-slate-600">No output yet.</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Current behavior
                    </div>
                    <pre className="whitespace-pre-wrap text-sm text-slate-800">
                      {result?.pseudocodeLocation?.currentBehaviorPseudocode || "—"}
                    </pre>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Where it goes wrong
                    </div>
                    <pre className="whitespace-pre-wrap text-sm text-slate-800">
                      {result?.pseudocodeLocation?.whereItGoesWrong || "—"}
                    </pre>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Corrected logic
                    </div>
                    <pre className="whitespace-pre-wrap text-sm text-slate-800">
                      {result?.pseudocodeLocation?.correctedLogicPseudocode || "—"}
                    </pre>
                  </div>
                </div>
              )}
            </Section>

            {/* Sequential Hint System */}
            <Section
              title="Hint System"
              right={
                <div className="flex items-center gap-2">
                  <Badge tone="blue">Sequential</Badge>
                  <Badge tone="gray">
                    Step {hintStep}/{Math.min(maxHintStep, hintsSorted.length || maxHintStep)}
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
                      onClick={() => setHintStep((s) => Math.min(s + 1, maxHintStep))}
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
                      Reveal hints one-by-one. Try to fix before revealing the next.
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[1, 2, 3].map((level) => {
                      const hintObj = hintsSorted.find((h) => h.level === level);
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
                              <Badge tone={visible ? "blue" : "gray"}>Hint {level}</Badge>
                              {!visible ? <Badge tone="gray">Locked</Badge> : <Badge tone="green">Revealed</Badge>}
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
            <Section title="Official Answer" right={<Badge tone="green">Solution</Badge>}>
              {!result ? (
                <div className="text-sm text-slate-600">No output yet.</div>
              ) 
               : hintStep < maxHintStep ?
               (
                <div className="text-sm text-slate-600">
                  Reveal all hints to unlock the official answer.
                </div>
               )
                : 
               (
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
                    {Array.isArray(result?.officialAnswer?.commonMistakesToAvoid) ? (
                      <ul className="list-disc pl-5 text-sm text-slate-800 space-y-1">
                        {result.officialAnswer.commonMistakesToAvoid.map((m, idx) => (
                          <li key={idx}>{m}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-slate-800">
                        {result?.officialAnswer?.commonMistakesToAvoid || "—"}
                      </div>
                    )}
                  </div>
                </div>
              ) }
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}
