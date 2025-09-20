import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { McLayout } from "../components/mc-layout";

export const Route = createRootRoute({
  component: () => (
    <McLayout>
      <Outlet />
      <TanStackRouterDevtools />
    </McLayout>
  ),
});
