import { createFileRoute } from "@tanstack/react-router";
import { Bookmarks } from "../screens/bookmarks";

export const Route = createFileRoute("/bookmarks")({
  component: Bookmarks,
});
