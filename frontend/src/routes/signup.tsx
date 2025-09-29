import { createFileRoute } from "@tanstack/react-router";
import { Signup } from "../screens/signup";

export const Route = createFileRoute("/signup")({
  component: Signup,
});