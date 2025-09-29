import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Search, Shuffle } from "lucide-react";

interface McSearchBarProps {
  handleSearch: () => void;
  keyword: string;
  handleKeywordChange: (value: string) => void;
  handleRandom: () => void;
}

export function McSearchBar({
  handleSearch,
  keyword,
  handleKeywordChange,
  handleRandom,
}: McSearchBarProps) {
  return (
    <div className="w-full flex gap-3">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input
          type="text"
          value={keyword}
          onChange={(e) => handleKeywordChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="搜索电影、电视剧、动漫..."
          className="pl-10 h-10"
        />
      </div>
      <Button
        onClick={handleSearch}
        disabled={!keyword.trim() || keyword.trim().length <= 1}
        className="px-8"
      >
        搜索
      </Button>
      <Button
        onClick={handleRandom}
        variant="secondary"
        className="px-8"
      >
        <Shuffle className="h-4 w-4 mr-2" />
        随机推荐
      </Button>
    </div>
  );
}