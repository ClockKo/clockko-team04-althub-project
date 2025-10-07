import { fetchCurrentSession, clockIn, clockOut, fetchUserData, fetchDashboardData } from "./api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import type { User, DashboardData } from "../../types/typesGlobal";

// ------------------ API Hooks ------------------

export function useCurrentSession() {
  return useQuery({
    queryKey: ["currentSession"],
    queryFn: fetchCurrentSession,
    retry: false,
    refetchOnWindowFocus: true, // Refetch when window gets focus
    staleTime: 0, // Always consider data stale to force refresh
  });
}

import { UserProfileResponse } from "./profileApi";

// Create a reusable query configuration
export const userDataQuery = {
  queryKey: ['userData'] as const,
  queryFn: fetchUserData,
  retry: false,
  refetchOnWindowFocus: true,
  refetchOnMount: true,
  refetchOnReconnect: true,
  staleTime: 0
};

export function useUserData() {
  return useQuery<UserProfileResponse>(userDataQuery);
}

export function useDashboardData() {
  return useQuery({
    queryKey: ["dashboardData"],
    queryFn: fetchDashboardData,
    retry: false,
    staleTime: 0, // Always consider data stale to force refresh when invalidated
    refetchOnWindowFocus: true, // Refetch when window gets focus
  });
}

export function useClockIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clockIn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["currentSession"] });
      qc.invalidateQueries({ queryKey: ["dashboardData"] });
    },
  });
}

export function useClockOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clockOut,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["currentSession"] });
      qc.invalidateQueries({ queryKey: ["dashboardData"] });
    },
  });
}