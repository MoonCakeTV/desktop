import { useNavigate } from "@tanstack/react-router";
import { Route } from "../../routes/play";
import { ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";

export function Play() {
  const navigate = useNavigate();
  const { mc_id } = Route.useSearch();

  return (
    <div className="px-4 sm:px-10 py-4 sm:py-8 w-full min-h-full">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: "/search" })}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Play</h1>
      </div>

      <div className="space-y-4">
        <p className="text-muted-foreground">Media ID: {mc_id}</p>
        {/* TODO: Implement video player and media details */}
      </div>
    </div>
  );
}
