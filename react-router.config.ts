import type { Config } from "@react-router/dev/config";
import { vercelPreset } from "@vercel/react-router/vite";

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
  presets: [vercelPreset()],
  appDirectory: "./src",
  future: {
    // Enables `export const middleware = [...]` on route files + root.tsx.
    // RR7 runs middleware chains natively; we use it instead of a custom
    // handleApi/handleLoader wrapper. See DOCS/observability-and-error-handling.md.
    v8_middleware: true,
  },
} satisfies Config;
