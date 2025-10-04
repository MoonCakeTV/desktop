import { createFileRoute } from "@tanstack/react-router";
import { Play } from "../screens/play";
import type { MediaItem } from "../components/mc-media-card";

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

declare module "@tanstack/react-router" {
  interface HistoryState {
    mediaItem?: MediaItem;
  }
}
