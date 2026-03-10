import { getBlockColour } from "../settings/colourPalette";


// VISUAL REBUILDER


// BLOCKS = [ 
//   { id: '1', type: 'control_repeat', label: 'repeat 10', depth: 0 },
// ]

// type: 'event'|'loop'|'condition'|'action'|'variable'|'operator'|'other'

// problemBlockId = '2' // matches specific block to highlight

// platform = 'scratch' | 'blockly' | 'edublocks' - for colour coding


export default function BlockPreview({
  blocks = [],
  problemBlockId,
  platform = "scratch",
}) {
  return (
    <div className="space-y-2">
      {blocks.map((block) => {
        const isProblem = block.id === problemBlockId; // highlight problem block
        const colour = getBlockColour(block.type, platform); // get colour based on type and platform

        return (
          <div
            key={block.id}
            style={{
              marginLeft: (block.depth ?? 0) * 16, // indent based on depth returned from AI -- 16px per layer
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
