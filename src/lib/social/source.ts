import { useRealSocial } from "./real-source";
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
