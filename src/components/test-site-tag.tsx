import { useEffect, useState } from "react";

import { TEST_PERSONA_KEY, TEST_PERSONA_NAME_KEY } from "@/lib/test-persona-keys";

// A small "Test site" tag at the top of the page, only on the test deploy
// (test.cbseuroski.com) and on localhost, so it can never show on the real
// site. On the test host, anyone who hasn't picked a person yet is sent to the
// picker first. The tag reads the saved choice from localStorage directly so
// the 200 invented people stay out of every page's bundle.
function saved(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function TestSiteTag() {
  const [show, setShow] = useState(false);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const host = window.location.hostname;
    const onTestHost = host.startsWith("test.");
    setShow(onTestHost || host === "localhost");
    const sync = () => setName(saved(TEST_PERSONA_NAME_KEY));
    sync();
    if (onTestHost && !saved(TEST_PERSONA_KEY) && window.location.pathname !== "/testdata") {
      window.location.replace("/testdata");
    }
    window.addEventListener("euro-ski-test-persona-change", sync);
    return () => window.removeEventListener("euro-ski-test-persona-change", sync);
  }, []);

  if (!show) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex justify-center">
      <span className="pointer-events-auto rounded-b-md bg-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-paper">
        Test site
        {name && (
          <>
            {" · "}
            {name}
            {" · "}
            <a href="/testdata" className="underline">
              switch
            </a>
          </>
        )}
      </span>
    </div>
  );
}
