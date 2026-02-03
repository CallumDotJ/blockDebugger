import Badge from "./Badge";

export default function SeverityBadge({ severity }) { // "High", "Medium", "Low"
  const s = (severity || "").toLowerCase();

  if (s === "high") return <Badge tone="red">High</Badge>;
  if (s === "medium") return <Badge tone="yellow">Medium</Badge>;

  return <Badge tone="green">Low</Badge>;

}