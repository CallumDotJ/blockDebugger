/* COLOUR PALETTES */

export const SCRATCH_COLORS = {
  event: "#FFD500",      // Events (yellow)
  loop: "#FFAB19",       // Control (orange)
  condition: "#FFAB19",  // Control
  action: "#4C97FF",     // Motion (blue)
  variable: "#FF8C1A",   // Variables (dark orange)
  operator: "#40BF4A",   // Operators (green)
  other: "#9966FF",      // My Blocks / misc
};

export const BLOCKLY_COLORS = {
  event: "#A5745B",      // Events / triggers
  loop: "#5BA58C",       // Loops
  condition: "#5C81A6",  // Logic
  action: "#4A90E2",     // Actions / procedures
  variable: "#A65C81",   // Variables
  operator: "#5CA65C",   // Math / logic
  other: "#888888",
};

export const EDUBLOCKS_COLORS = {
  event: "#F4C430",      // Setup / start
  loop: "#F39C12",       // Control
  condition: "#E67E22",  // Logic
  action: "#3498DB",     // Statements
  variable: "#D35400",   // Variables
  operator: "#2ECC71",   // Operators
  other: "#7F8C8D",
};

export function getBlockColour(type, platform = 'edublocks')
{
    const palletes = {
        scratch: SCRATCH_COLORS,
        blockly: BLOCKLY_COLORS,
        edublocks: EDUBLOCKS_COLORS
    }

    return palletes[platform]?.[type] || "#CBD5E1" // fallback of slate
}
 