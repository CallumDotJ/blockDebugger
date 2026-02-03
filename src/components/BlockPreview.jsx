import { getBlockColour } from "../settings/colourPalette";

export default function BlockPreview({
  blocks = [],
  problemBlockId,
  platform = "scratch",
}) {
  return (
    <div className="space-y-2">
      {blocks.map((block) => {
        const isProblem = block.id === problemBlockId;
        const colour = getBlockColour(block.type, platform);

        return (
          <div
            key={block.id}
            style={{
              marginLeft: (block.depth ?? 0) * 16,
              borderLeft: `6px solid ${colour}`,
            }}
            className={`rounded-lg border px-3 py-2 text-sm ${
              isProblem
                ? "border-red-500 bg-red-50 font-semibold"
                : "border-slate-200 bg-white"
            }`}
          >
            <span className="mr-2 uppercase text-xs text-slate-500">
              {block.type}
            </span>
            {block.label}
          </div>
        );
      })}
    </div>
  );
}
