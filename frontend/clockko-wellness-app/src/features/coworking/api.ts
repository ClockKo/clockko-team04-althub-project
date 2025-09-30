import type { RoomSummary, Room } from "../../types/typesGlobal";
import { coworkingService } from "./coworkingService";

// API functions for co-working rooms
export async function fetchRooms(): Promise<RoomSummary[]> {
  try {
    // Try backend API first (when available)
    const res = await fetch("/api/coworking/rooms");
    if (!res.ok) throw new Error("API not ready");
    return await res.json();
  } catch {
    // Use coworking service with localStorage
    return await coworkingService.getRooms();
  }
}

export async function fetchRoom(roomId: string): Promise<Room | null> {
  try {
    // Try backend API first (when available)
    const res = await fetch(`/api/coworking/rooms/${roomId}`);
    if (!res.ok) throw new Error("API not ready");
    return await res.json();
  } catch {
    // Use coworking service with localStorage
    return await coworkingService.getRoom(roomId);
  }
}