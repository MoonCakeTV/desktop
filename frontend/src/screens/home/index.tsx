import { DoubanTags } from "../../components/douban/tags";
import { RandomMedia } from "../../components/random-media";

export function Home() {
  return (
    <div className="flex flex-1 bg-gray-200 h-screen overflow-y-auto">
      <div className="flex flex-col w-full gap-6 p-4 sm:p-10">
        <DoubanTags />
        <RandomMedia />
      </div>
    </div>
  );
}
