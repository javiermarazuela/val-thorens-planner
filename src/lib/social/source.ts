import { useRealSocial } from "./real-source";
import { useRealCrewAccess, useRealTeams } from "./real-teams-source";
import type { CrewAccess, TeamsState } from "./teams-types";
import type { SocialState } from "./types";

// Exists only on the test branch. A glob, not an import, so the real site builds
// without it and carries none of the invented travellers.
const testModules = import.meta.glob<{ useTestSocial: () => SocialState }>("./test-source.ts", {
  eager: true,
});

const useTest = Object.values(testModules)[0]?.useTestSocial;

function onTestHost(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host.startsWith("test.") || host === "localhost";
}

/**
 * Who the crew pages show. The real site reads Supabase; on the test host the
 * test source swaps in the invented crowd. The host never changes during a
 * visit, so choosing the hook once per render is safe.
 */
export function useSocial(): SocialState {
  const useHook = useTest && onTestHost() ? useTest : useRealSocial;
  return useHook();
}

const testTeamModules = import.meta.glob<{
  useTestTeams: () => TeamsState;
  useTestCrewAccess: () => CrewAccess;
}>("./test-teams-source.ts", { eager: true });

const testTeams = Object.values(testTeamModules)[0];
const useTestTeamsHook = testTeams?.useTestTeams;
const useTestAccessHook = testTeams?.useTestCrewAccess;

/** Same idea as useSocial, for the teams tab. */
export function useTeams(): TeamsState {
  const useHook = useTestTeamsHook && onTestHost() ? useTestTeamsHook : useRealTeams;
  return useHook();
}

/** Who is signed in and which team they are on, for the guide pages. */
export function useCrewAccess(): CrewAccess {
  const useHook = useTestAccessHook && onTestHost() ? useTestAccessHook : useRealCrewAccess;
  return useHook();
}
