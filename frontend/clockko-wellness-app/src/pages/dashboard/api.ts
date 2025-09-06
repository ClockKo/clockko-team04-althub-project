/*api.ts               // API functions to fetch dashboard data*/

export async function fetchCurrentSession() {
  const res = await fetch("/api/dashboard/current-session", { credentials: "include" });
  if (!res.ok) throw new Error("No ongoing session");
  return await res.json();
}

export async function clockIn() {
  const res = await fetch("/api/dashboard/clock-in", {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to clock in");
  return await res.json();
}

export async function clockOut() {
  const res = await fetch("/api/dashboard/clock-out", {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to clock out");
  return await res.json();
}

export async function fetchUserData() {
  const res = await fetch("/api/user/profile", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch user data");
  return await res.json();
}

export async function fetchDashboardData() {
  const res = await fetch("/api/dashboard/data", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch dashboard data");
  return await res.json();
}