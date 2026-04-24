import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        // Server/client boundary enforcement
        files: ["src/server/**/*.ts"],
        rules: {
            "no-restricted-imports": ["error", {
                patterns: [{
                    group: ["@/client/*"],
                    message: "Server code cannot import from client modules.",
                }],
            }],
        },
    },
    {
        files: ["src/client/**/*.ts", "src/client/**/*.tsx"],
        rules: {
            "no-restricted-imports": ["error", {
                patterns: [{
                    group: ["@/server/*"],
                    message: "Client code cannot import from server modules.",
                }],
            }],
        },
    },
    {
        files: ["src/shared/**/*.ts"],
        rules: {
            "no-restricted-imports": ["error", {
                patterns: [{
                    group: ["@/server/*", "@/client/*"],
                    message: "Shared code cannot import from server or client modules.",
                }],
            }],
        },
    },
    {
        // Ignore build output and node_modules
        ignores: ["build/**", "node_modules/**", ".react-router/**"],
    },
];
