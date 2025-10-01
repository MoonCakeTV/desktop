import { useState, useEffect } from "react";
import { Loader2, Bookmark as BookmarkIcon, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { MediaCard, type MediaItem } from "../../components/mc-media-card";
import { useUserStore } from "../../stores/user-store";
import {
  RemoveBookmark,
  GetBookmarkedMediaDetails,
  GetUserBookmarks,
} from "../../../wailsjs/go/main/App";
import { Button } from "../../components/ui/button";

export function Bookmarks() {
  const [bookmarkedMedia, setBookmarkedMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const { user } = useUserStore();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      try {
        // Fetch bookmarked mc_ids
        const bookmarkIdsResponse = await GetUserBookmarks(user.id);
        if (!bookmarkIdsResponse.success || !bookmarkIdsResponse.data) {
          setIsLoading(false);
          return;
        }

        const mcIds = bookmarkIdsResponse.data;
        setBookmarks(new Set(mcIds));

        // Try to fetch from database first
        const dbResponse = await GetBookmarkedMediaDetails(user.id);
        const dbMediaMap = new Map<string, any>();

        if (dbResponse.success && dbResponse.data) {
          dbResponse.data.forEach((item: any) => {
            dbMediaMap.set(item.mc_id, item);
          });
        }

        // Fetch media details from API for each bookmark
        const mediaPromises = mcIds.map(async (mcId) => {
          // Check if we have it in database
          const dbItem = dbMediaMap.get(mcId);
          if (dbItem && dbItem.title) {
            let m3u8_urls = {};
            try {
              if (dbItem.m3u8_urls && typeof dbItem.m3u8_urls === "string") {
                m3u8_urls = JSON.parse(dbItem.m3u8_urls);
              }
            } catch (e) {
              console.warn(`Failed to parse m3u8_urls for ${mcId}:`, e);
            }

            return {
              mc_id: dbItem.mc_id,
              title: dbItem.title,
              poster: dbItem.poster,
              year: dbItem.year?.toString(),
              rating: dbItem.rating,
              category: dbItem.category,
              m3u8_urls,
            };
          }

          // Fallback: fetch from API
          try {
            const res = await fetch(`https://s1.m3u8.io/v1/mc_item/${mcId}`);
            const json = await res.json();

            if (json.code === 200 && json.data?.mc_item) {
              const item = json.data.mc_item;
              let m3u8_urls = {};
              try {
                if (item.m3u8_urls && typeof item.m3u8_urls === "string") {
                  m3u8_urls = JSON.parse(item.m3u8_urls);
                }
              } catch (e) {
                console.warn(`Failed to parse m3u8_urls for ${mcId}:`, e);
              }

              return {
                mc_id: item.mc_id,
                title: item.title || "未知",
                poster: item.cover_image,
                year: item.year?.toString(),
                rating: undefined, // API doesn't return rating
                region: item.region,
                category: item.category,
                m3u8_urls,
              };
            }
          } catch (error) {
            console.error(`Failed to fetch media ${mcId}:`, error);
          }
          return null;
        });

        const mediaResults = await Promise.all(mediaPromises);
        setBookmarkedMedia(
          mediaResults.filter((media) => media !== null) as MediaItem[]
        );
      } catch (error) {
        console.error("Failed to fetch bookmarks:", error);
        toast.error("获取收藏失败");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookmarks();
  }, [user?.id, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleBookmarkToggle = async (mcId: string) => {
    if (!user?.id) {
      toast.error("请先登录");
      return;
    }

    try {
      const response = await RemoveBookmark(user.id, mcId);
      if (response.success) {
        setBookmarks((prev) => {
          const newSet = new Set(prev);
          newSet.delete(mcId);
          return newSet;
        });
        setBookmarkedMedia((prev) => prev.filter((m) => m.mc_id !== mcId));
        toast.success("已取消收藏");
      } else {
        toast.error(response.error || "取消收藏失败");
      }
    } catch (error) {
      console.error("Bookmark toggle error:", error);
      toast.error("操作失败");
    }
  };

  return (
    <div className="flex flex-1 bg-gray-200 h-screen overflow-y-auto">
      <div className="flex flex-col w-full gap-6 p-4 sm:p-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookmarkIcon className="w-8 h-8 text-gray-900" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              我的收藏
            </h1>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            刷新
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-10 h-10 animate-spin" />
          </div>
        ) : bookmarkedMedia.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BookmarkIcon className="w-16 h-16 text-slate-300 mb-4" />
            <p className="text-slate-500 text-lg">暂无收藏内容</p>
            <p className="text-slate-400 text-sm mt-2">
              浏览影片时点击收藏图标即可添加到收藏夹
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {bookmarkedMedia.map((media) => (
              <MediaCard
                key={media.mc_id}
                mediaItem={media}
                onClick={() => {
                  console.log("Navigate to play:", media.mc_id);
                  toast.info(`Playing: ${media.title}`);
                }}
                isBookmarked={bookmarks.has(media.mc_id)}
                onBookmarkToggle={handleBookmarkToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
