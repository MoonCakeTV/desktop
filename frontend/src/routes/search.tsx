import { createFileRoute } from "@tanstack/react-router";
import { Search } from "../screens/search";

export const Route = createFileRoute("/search")({
  component: Search,
});
