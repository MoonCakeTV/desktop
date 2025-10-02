import { useState, useEffect } from "react";
import { Loader2, Bookmark as BookmarkIcon, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { MediaCard, type MediaItem } from "../../components/mc-media-card";
import { useUserStore } from "../../stores/user-store";
import {
  RemoveBookmark,
  GetBookmarkedMediaDetails,
  GetUserBookmarks,
  SaveMediaInfo,
} from "../../../wailsjs/go/main/App";
import { Button } from "../../components/ui/button";

interface MediaItemWithLoading extends MediaItem {
  isLoading?: boolean;
}

export function Bookmarks() {
  const [bookmarkedMedia, setBookmarkedMedia] = useState<MediaItemWithLoading[]>([]);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const { user } = useUserStore();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user?.id) return;

      try {
        // Fetch bookmarked mc_ids
        const bookmarkIdsResponse = await GetUserBookmarks(user.id);
        if (!bookmarkIdsResponse.success || !bookmarkIdsResponse.data) {
          return;
        }

        const mcIds = bookmarkIdsResponse.data;
        setBookmarks(new Set(mcIds));

        // Fetch from database
        const dbResponse = await GetBookmarkedMediaDetails(user.id);
        const dbMediaMap = new Map<string, any>();

        if (dbResponse.success && dbResponse.data) {
          dbResponse.data.forEach((item: any) => {
            dbMediaMap.set(item.mc_id, item);
          });
        }

        // Separate items into those with data and those needing fetch
        const mediaWithData: MediaItemWithLoading[] = [];
        const missingMcIds: string[] = [];

        mcIds.forEach((mcId) => {
          const dbItem = dbMediaMap.get(mcId);
          if (dbItem && dbItem.title) {
            // Item exists in database
            let m3u8_urls = {};
            try {
              if (dbItem.m3u8_urls && typeof dbItem.m3u8_urls === "string") {
                m3u8_urls = JSON.parse(dbItem.m3u8_urls);
              }
            } catch (e) {
              console.warn(`Failed to parse m3u8_urls for ${mcId}:`, e);
            }

            mediaWithData.push({
              mc_id: dbItem.mc_id,
              title: dbItem.title,
              poster: dbItem.poster,
              year: dbItem.year?.toString(),
              rating: dbItem.rating,
              region: dbItem.region,
              category: dbItem.category,
              m3u8_urls,
            });
          } else {
            // Item needs to be fetched
            missingMcIds.push(mcId);
            // Add placeholder with loading indicator
            mediaWithData.push({
              mc_id: mcId,
              title: "加载中...",
              isLoading: true,
            });
          }
        });

        setBookmarkedMedia(mediaWithData);

        // Fetch missing items from API using Promise.allSettled
        if (missingMcIds.length > 0) {
          const fetchPromises = missingMcIds.map((mcId) =>
            fetch(`https://s1.m3u8.io/v1/mc_item/${mcId}`)
              .then((res) => res.json())
              .then((json) => ({ mcId, json, error: null }))
              .catch((error) => ({ mcId, json: null, error }))
          );

          const results = await Promise.allSettled(fetchPromises);

          // Process each result
          for (const result of results) {
            if (result.status === "fulfilled") {
              const { mcId, json, error } = result.value;

              if (error) {
                console.error(`Failed to fetch media ${mcId}:`, error);
                // Update placeholder to show error
                setBookmarkedMedia((prev) =>
                  prev.map((item) =>
                    item.mc_id === mcId
                      ? { ...item, title: "加载失败", isLoading: false }
                      : item
                  )
                );
                continue;
              }

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

                const mediaItem: MediaItem = {
                  mc_id: item.mc_id,
                  title: item.title || "未知",
                  poster: item.cover_image,
                  year: item.year?.toString(),
                  rating: undefined,
                  region: item.region,
                  category: item.category,
                  m3u8_urls,
                };

                // Save to database
                try {
                  const year = item.year || 0;
                  const m3u8UrlsStr = JSON.stringify(m3u8_urls);

                  await SaveMediaInfo(
                    item.mc_id,
                    item.title || "未知",
                    item.summary || "",
                    year,
                    "", // genre
                    item.region || "",
                    item.category || "",
                    item.cover_image || "",
                    m3u8UrlsStr,
                    0 // rating
                  );
                } catch (saveError) {
                  console.error(`Failed to save media ${mcId}:`, saveError);
                }

                // Update the UI
                setBookmarkedMedia((prev) =>
                  prev.map((prevItem) =>
                    prevItem.mc_id === mcId ? mediaItem : prevItem
                  )
                );
              } else {
                console.error(`Invalid response for media ${mcId}:`, json);
                setBookmarkedMedia((prev) =>
                  prev.map((item) =>
                    item.mc_id === mcId
                      ? { ...item, title: "加载失败", isLoading: false }
                      : item
                  )
                );
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch bookmarks:", error);
        toast.error("获取收藏失败");
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
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
        </div>

        {bookmarkedMedia.length === 0 ? (
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
                  if (!media.isLoading) {
                    console.log("Navigate to play:", media.mc_id);
                    toast.info(`Playing: ${media.title}`);
                  }
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
