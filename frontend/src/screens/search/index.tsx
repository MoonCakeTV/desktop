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
    console.log("searchTerm :>> ", searchTerm);
    if (!searchTerm.trim() || searchTerm.trim().length <= 1) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(
        `https://s1.m3u8.io/v1/search2?keyword=${encodeURIComponent(searchTerm)}`
      );
      const json = await res.json();
      setResults(
        (json.data?.items || []).map((item: any) => ({
          id: item.id,
          mc_id: item.mc_id,
          title: item.title || item.name || "未知",
          poster: item.poster,
          year: item.year,
          rating: item.rating,
        }))
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
      setResults(
        (json.data?.items || []).map((item: any) => ({
          id: item.id,
          mc_id: item.mc_id,
          title: item.title || item.name || "未知",
          poster: item.poster,
          year: item.year,
          rating: item.rating,
        }))
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
    console.log("urlKeyword :>> ", urlKeyword);
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
              key={result.id}
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
