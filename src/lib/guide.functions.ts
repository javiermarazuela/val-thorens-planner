import { createServerFn } from "@tanstack/react-start";

/**
 * Dormant protection boundary.
 *
 * Sensitive attendee detail (door codes, rooming lists, WhatsApp links,
 * per-flight transfer assignments) is served only from here, never bundled
 * into the browser. Turning the gate on later needs a shared password, a
 * session secret and an unlock screen — no page restructuring.
 */
async function requireGuideAccess() {
  const gateEnabled = false;
  if (!gateEnabled) return { unlocked: false as const };
  return { unlocked: true as const };
}

export type ProtectedDetail = {
  unlocked: boolean;
  items: { label: string; value: string }[];
};

export const getProtectedDetail = createServerFn({ method: "GET" }).handler(
  async (): Promise<ProtectedDetail> => {
    const access = await requireGuideAccess();
    if (!access.unlocked) return { unlocked: false, items: [] };
    // Protected content will be returned here once the password gate is enabled.
    return { unlocked: true, items: [] };
  },
);
