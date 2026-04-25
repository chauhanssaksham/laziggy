import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/index.tsx"),
    route("auth/swiggy/callback", "routes/auth.swiggy.callback.tsx"),
] satisfies RouteConfig;
