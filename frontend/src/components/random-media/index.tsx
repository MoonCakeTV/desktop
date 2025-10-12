import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { MediaCard, type MediaItem } from "../mc-media-card";
import { useUserStore } from "../../stores/user-store";
import { parse_m3u8_urls } from "../../lib/media-utils";
import {
  AddBookmark,
  RemoveBookmark,
  GetUserBookmarks,
  SaveMediaInfo,
} from "../../../wailsjs/go/main/App";

export function RandomMedia() {
  const navigate = useNavigate();
  const [randomMediaItems, setRandomMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const { user } = useUserStore();

  useEffect(() => {
    const fetchRandomMedia = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`https://s1.m3u8.io/v1/random`);
        const json = await res.json();

        if (json.code !== 200) {
          toast.error(json.message || "获取随机内容失败");
          setRandomMediaItems([]);
          return;
        }

        setRandomMediaItems(
          (json.data?.items || []).map((item: any) => {
            const m3u8_urls = parse_m3u8_urls(item.m3u8_urls);

            return {
              mc_id: item.mc_id,
              title: item.title || "未知",
              poster: item.cover_image,
              year: item.year?.toString(),
              rating: item.rating,
              region: item.region,
              category: item.category,
              m3u8_urls,
            };
          })
        );
      } catch (error) {
        console.error(error);
        toast.error("获取随机内容失败");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRandomMedia();
  }, []);

  // Fetch user bookmarks
  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user?.id) return;
      try {
        const response = await GetUserBookmarks(user.id);
        if (response.success && response.data) {
          setBookmarks(new Set(response.data));
        }
      } catch (error) {
        console.error("Failed to fetch bookmarks:", error);
      }
    };
    fetchBookmarks();
  }, [user?.id]);

  const handleBookmarkToggle = async (mcId: string) => {
    if (!user?.id) {
      toast.error("请先登录");
      return;
    }

    const isBookmarked = bookmarks.has(mcId);

    try {
      if (isBookmarked) {
        const response = await RemoveBookmark(user.id, mcId);
        if (response.success) {
          setBookmarks((prev) => {
            const newSet = new Set(prev);
            newSet.delete(mcId);
            return newSet;
          });
          toast.success("已取消收藏");
        } else {
          toast.error(response.error || "取消收藏失败");
        }
      } else {
        // Find the media details before bookmarking
        const media = randomMediaItems.find((m) => m.mc_id === mcId);
        if (media) {
          // Save media info to database first
          const year = media.year ? parseInt(media.year) : 0;
          const m3u8UrlsStr = JSON.stringify(media.m3u8_urls || {});

          await SaveMediaInfo(
            media.mc_id,
            media.title,
            "", // description
            year,
            "", // genre (not in random results)
            media.region || "",
            media.category || "",
            media.poster || "",
            m3u8UrlsStr,
            media.rating || 0
          );
        }

        const response = await AddBookmark(user.id, mcId);
        if (response.success) {
          setBookmarks((prev) => new Set(prev).add(mcId));
          toast.success("收藏成功");
        } else {
          toast.error(response.error || "收藏失败");
        }
      }
    } catch (error) {
      console.error("Bookmark toggle error:", error);
      toast.error("操作失败");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
        随机推荐
      </h2>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-10 h-10 animate-spin" />
        </div>
      ) : randomMediaItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-slate-500">暂无推荐内容</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {randomMediaItems.map((mediaItem) => (
            <MediaCard
              key={mediaItem.mc_id}
              mediaItem={mediaItem}
              onClick={() => {
                navigate({
                  to: "/play",
                  search: { mc_id: mediaItem.mc_id },
                  state: { mediaItem },
                });
              }}
              isBookmarked={bookmarks.has(mediaItem.mc_id)}
              onBookmarkToggle={handleBookmarkToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
