import { createFileRoute } from "@tanstack/react-router";
import { Play } from "../screens/play";

export const Route = createFileRoute("/play")({
  component: Play,
  validateSearch: (search: Record<string, unknown>): { mc_id: string } => {
    const mc_id = search.mc_id;
    if (typeof mc_id !== "string" || !mc_id) {
      throw new Error("mc_id is required and must be a non-empty string");
    }
    return { mc_id };
  },
});
