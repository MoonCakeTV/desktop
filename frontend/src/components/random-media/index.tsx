import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { MediaCard, type MediaItem } from "../mc-media-card";

export function RandomMedia() {
  const [randomMedia, setRandomMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRandomMedia = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`https://s1.m3u8.io/v1/random`);
        const json = await res.json();

        if (json.code !== 200) {
          toast.error(json.message || "获取随机内容失败");
          setRandomMedia([]);
          return;
        }

        setRandomMedia(
          (json.data?.items || []).map((item: any) => {
            let m3u8_urls = {};
            try {
              if (item.m3u8_urls && typeof item.m3u8_urls === "string") {
                m3u8_urls = JSON.parse(item.m3u8_urls);
              }
            } catch (e) {
              console.warn(`Failed to parse m3u8_urls for ${item.mc_id}:`, e);
            }

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

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
        随机推荐
      </h2>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-10 h-10 animate-spin" />
        </div>
      ) : randomMedia.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-slate-500">暂无推荐内容</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {randomMedia.map((media) => (
            <MediaCard
              key={media.mc_id}
              mediaItem={media}
              onClick={() => {
                console.log("Navigate to play:", media.mc_id);
                toast.info(`Playing: ${media.title}`);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
