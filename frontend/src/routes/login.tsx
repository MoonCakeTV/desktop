import { createFileRoute } from "@tanstack/react-router";
import { Login } from "../screens/login";

export const Route = createFileRoute("/login")({
  component: Login,
});