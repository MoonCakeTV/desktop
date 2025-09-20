import { DoubanTags } from "../../components/douban/tags";

export function Home() {
  return (
    <div className="flex flex-1 bg-gray-200 h-screen overflow-y-auto">
      <DoubanTags />
    </div>
  );
}