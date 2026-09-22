import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vite";

// Plugin order matters: tsConfigPaths resolves the "@/*" alias before
// tanstackStart generates the route tree, and nitro builds the server bundle
// last from the entry tanstackStart points at.
export default defineConfig({
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart({
      // Route TanStack Start's bundled server entry through src/server.ts,
      // our SSR error wrapper. nitro builds from this.
      server: { entry: "server" },
    }),
    viteReact(),
    // Vercel, not the cloudflare-module default we inherited from Lovable.
    nitro({ preset: "vercel" }),
  ],
  // Keep a single copy of React and the TanStack packages in the graph; two
  // copies break hooks and router context under SSR.
  resolve: {
    dedupe: [
      "react",
      "react-dom",
      "@tanstack/react-router",
      "@tanstack/react-start",
      "@tanstack/react-query",
    ],
  },
});
