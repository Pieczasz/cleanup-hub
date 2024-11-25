
export type EventType = "cleaning" | "treePlanting" | "volunteering" | "other";

export const eventTypeColors: Record<EventType, string> = {
  cleaning: "bg-green-100 text-green-800",
  treePlanting: "bg-emerald-100 text-emerald-800",
  volunteering: "bg-blue-100 text-blue-800",
  other: "bg-gray-100 text-gray-800",
};