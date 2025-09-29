import { Play, Star } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";

export interface MediaItem {
  id: string;
  mc_id: string;
  title: string;
  poster?: string;
  year?: string;
  rating?: number;
}

interface MediaCardProps {
  media: MediaItem;
  onClick: () => void;
  className?: string;
}

export function MediaCard({ media, onClick, className }: MediaCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer group transition-all hover:scale-105 overflow-hidden",
        className
      )}
    >
      <CardContent className="p-0">
        <div className="relative aspect-[2/3] bg-slate-100">
          {media.poster ? (
            <img
              src={media.poster}
              alt={media.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <Play className="w-12 h-12" />
            </div>
          )}
          {/* Overlay gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="p-3">
          <h3 className="font-medium text-sm truncate" title={media.title}>
            {media.title}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            {media.year && <span>{media.year}</span>}
            {media.rating && (
              <div className="flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                <span className="text-yellow-600 font-medium">
                  {media.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}