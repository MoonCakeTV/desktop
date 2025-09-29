import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Route } from "../../routes/search";
import { Loader2, Play } from "lucide-react";
import { toast } from "sonner";
import { McSearchBar } from "../../components/mc-search-bar";
import { MediaCard, type MediaItem } from "../../components/mc-media-card";

export function Search() {
  const navigate = useNavigate();
  const searchParams = Route.useSearch();

  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (searchKeyword?: string) => {
    const searchTerm = searchKeyword ?? keyword;
    if (!searchTerm.trim() || searchTerm.trim().length <= 1) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(
        `https://s1.m3u8.io/v1/search2?keyword=${encodeURIComponent(searchTerm)}`
      );
      const json = await res.json();

      // Check if the response code is 200
      if (json.code !== 200) {
        toast.error(json.message || "搜索失败");
        setResults([]);
        return;
      }

      // {
      //   code: 200;
      //   message: "success";
      //   data: {
      //     items: [
      //       {
      //         mc_id: "c1XXuXFk5eIaEEB_5jYUc",
      //         title: "初吻",
      //         language: "其他",
      //         year: 2012,
      //         region: "泰国",
      //         summary:
      //           "25岁的莎莎（Khanungnit Jaksamitthanont饰）仍沉浸在多年前的单恋里不能自拔，感情生活一片空白。她还在痴痴地等待着男孩的回心转意。终于，上天给了她一件出乎意料的礼物。男孩回国后\n\n25岁的莎莎（Khanungnit Jaksamitthanont饰）仍沉浸在多年前的单恋里不能自拔，感情生活一片空白。她还在痴痴地等待着男孩的回心转意。终于，上天给了她一件出乎意料的礼物。男孩回国后居然对莎莎展开热烈的追求，心花怒放的莎莎以为终于守得云开见月明。然而当她正幻想着与男孩的美好生活时，高中生潘贝斯（Takrit Hemannopjit 饰）意外地闯入了的她的生活。在公交车上，莎莎跟潘贝斯意外的发生了亲吻，莎莎的初吻就这样莫名其妙的被潘贝斯夺走了。嘴角总是带着坏坏笑容的潘贝斯，一下子就爱上了莎莎，对她展开了热烈的追求。然而面对年龄、经历等方面的巨大差别，这对看上去完全不可能在一起的恋人，最终能否走在一起呢？",
      //         casting:
      //           "KaneungnichJaksamithanon,PichasiniTanwiboon,SongsittRungnoppakhunsri,TakritHemannopjit,TinChokamolkit",
      //         category: "爱情",
      //         douban_id: "",
      //         imdb_id: "",
      //         tmdb_id: "",
      //         m3u8_urls:
      //           '{"正片":"https://tyyszywvod5.com/videos/202412/30/6771e7cb8b3ec726a9fadc03/cg8bcc/index.m3u8"}',
      //         cover_image:
      //           "http://tyyswimg.com/upload/vod/20241230-3/4d2542fa8cc505b43f316424cdfff3fb.jpg",
      //       },
      //     ],
      //     count: 100,
      //     keyword
      //   }
      // }

      setResults(
        (json.data?.items || []).map((item: any) => {
          // Parse m3u8_urls safely
          let m3u8_urls = {};
          try {
            if (item.m3u8_urls && typeof item.m3u8_urls === 'string') {
              m3u8_urls = JSON.parse(item.m3u8_urls);
            }
          } catch (e) {
            console.warn(`Failed to parse m3u8_urls for ${item.mc_id}:`, e);
          }

          return {
            mc_id: item.mc_id,
            title: item.title || "未知",
            poster: item.cover_image,  // Use cover_image as poster
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
      toast.error("搜索失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRandom = async () => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`https://s1.m3u8.io/v1/random`);
      const json = await res.json();

      // Check if the response code is 200
      if (json.code !== 200) {
        toast.error(json.message || "获取随机内容失败");
        setResults([]);
        return;
      }

      setResults(
        (json.data?.items || []).map((item: any) => {
          // Parse m3u8_urls safely
          let m3u8_urls = {};
          try {
            if (item.m3u8_urls && typeof item.m3u8_urls === 'string') {
              m3u8_urls = JSON.parse(item.m3u8_urls);
            }
          } catch (e) {
            console.warn(`Failed to parse m3u8_urls for ${item.mc_id}:`, e);
          }

          return {
            mc_id: item.mc_id,
            title: item.title || "未知",
            poster: item.cover_image,  // Use cover_image as poster
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

  // Sync keyword with URL param and trigger search
  // first render only!!!
  useEffect(() => {
    const urlKeyword = (searchParams as any)?.keyword || "";
    if (urlKeyword) {
      setKeyword(urlKeyword);
      handleSearch(urlKeyword);
    }
  }, []);

  const updateUrlParams = (newKeyword: string) => {
    navigate({
      to: "/search",
      search: newKeyword.trim() ? { keyword: newKeyword.trim() } : {},
      replace: true,
    });
  };

  const handleKeywordChange = (v: string) => {
    setKeyword(v);
    updateUrlParams(v);
  };

  if (isLoading) {
    return (
      <div className="px-4 sm:px-10 py-4 sm:py-8 overflow-visible w-full min-h-full flex flex-col gap-4">
        <McSearchBar
          handleSearch={handleSearch}
          keyword={keyword}
          handleKeywordChange={handleKeywordChange}
          handleRandom={handleRandom}
        />
        <div className="grow flex items-center justify-center w-full h-full">
          <Loader2 className="w-10 h-10 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-10 py-4 sm:py-8 overflow-visible w-full min-h-full flex flex-col gap-4">
      <McSearchBar
        handleSearch={handleSearch}
        keyword={keyword}
        handleKeywordChange={handleKeywordChange}
        handleRandom={handleRandom}
      />
      {!hasSearched ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Play className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            开始搜索内容
          </h3>
          <p className="text-slate-500 max-w-sm">
            在上方输入关键词并按回车键开始搜索
          </p>
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Play className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            没有找到相关内容
          </h3>
          <p className="text-slate-500 max-w-sm">
            尝试使用不同的关键词或检查拼写是否正确
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {results.map((result) => (
            <MediaCard
              key={result.mc_id}
              media={result}
              onClick={() => {
                // TODO: Navigate to play page when it's implemented
                console.log("Navigate to play:", result.mc_id);
                toast.info(`Playing: ${result.title}`);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
