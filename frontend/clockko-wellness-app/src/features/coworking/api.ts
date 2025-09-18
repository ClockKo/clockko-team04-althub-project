import type { RoomSummary, Room } from "../../types/typesGlobal";

// Demo Data
export const DEMO_ROOMS: RoomSummary[] = [
  { id: "focus", name: "Focus Zone", description: "Deep Work", status: "rooms", count: 12, color: "bg-blue-50" },
  { id: "pomodoro", name: "Pomodoro Power", description: "30 min Sessions", status: "active", count: 15, color: "bg-green-50" },
  { id: "slowstart-1", name: "Slow Start", description: "Light work", status: "active", count: 8, color: "bg-green-50" },
  { id: "slowstart-2", name: "Slow Start", description: "Light work", status: "active", count: 8, color: "bg-blue-50" },
];

export const DEMO_ROOM: Room = {
  id: "focus",
  name: "Focus Zone",
  description: "Deep Work",
  participants: [
    { id: "1", name: "Jess", avatar: "https://avatar.iran.liara.run/public", isSpeaking: true, muted: false },
    { id: "2", name: "Tom", avatar: "https://avatar.iran.liara.run/public", isSpeaking: false, muted: true },
    { id: "3", name: "Sam", avatar: "https://avatar.iran.liara.run/public", isSpeaking: false, muted: false },
    { id: "4", name: "Alex", avatar: "https://avatar.iran.liara.run/public", isSpeaking: false, muted: true },
    { id: "5", name: "Meg", avatar: "https://avatar.iran.liara.run/public", isSpeaking: false, muted: true },
  ],
  messages: [
    { id: "m1", user: "Jess", avatar: "https://avatar.iran.liara.run/public", text: "Let's take things slow and steady.", time: "9:55am" },
    { id: "m2", user: "Jess", avatar: "https://avatar.iran.liara.run/public", text: "Let's take things slow and steady.", time: "9:55am" },
    { id: "m3", user: "Jess", avatar: "https://avatar.iran.liara.run/public", text: "Let's take things slow and steady.", time: "9:55am" },
  ],
};

export async function fetchRooms(): Promise<RoomSummary[]> {
  try {
    const res = await fetch("/api/rooms");
    if (!res.ok) throw new Error("API not ready");
    return await res.json();
  } catch {
    return DEMO_ROOMS;
  }
}

export async function fetchRoom(roomId: string): Promise<Room> {
  try {
    const res = await fetch(`/api/rooms/${roomId}`);
    if (!res.ok) throw new Error("API not ready");
    return await res.json();
  } catch {
    return DEMO_ROOM;
  }
}