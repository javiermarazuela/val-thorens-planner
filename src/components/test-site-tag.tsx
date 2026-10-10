import { useEffect, useState } from "react";

// A small "Test site" tag at the top of the page, only on the test deploy
// (test.cbseuroski.com) and on localhost, so it can never show on the real site.
export function TestSiteTag() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const host = window.location.hostname;
    setShow(host.startsWith("test.") || host === "localhost");
  }, []);
  if (!show) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex justify-center">
      <span className="rounded-b-md bg-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-paper">
        Test site
      </span>
    </div>
  );
}
