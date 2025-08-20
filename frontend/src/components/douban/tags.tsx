import { useEffect, useState } from "react";

import { DoubanMovieItem, DoubanTVItem } from "./types";
import { Badge } from "@/components/ui/badge";

export const DoubanTags = () => {
  const [movies, setMovies] = useState<DoubanMovieItem[]>([]);
  const [tvs, setTvs] = useState<DoubanTVItem[]>([]);

  useEffect(() => {
    fetch("https://s1.m3u8.io/v1/douban")
      .then((res) => res.json())
      .then((json) => {
        setMovies(json.data?.movies || []);
        setTvs(json.data?.tv || []);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <div className="px-2 sm:px-10 py-4 sm:py-8 overflow-visible flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          豆瓣热门电影
        </h2>
        <div className="flex flex-wrap gap-2">
          {movies.map((movie) => (
            <Badge
              variant="outline"
              key={movie.id}
              className="cursor-pointer hover:bg-purple-900 hover:text-white px-2 py-1 border-2 border-blue-300 dark:border-gray-700"
              onClick={() => {
                window.open(
                  `/search?keyword=${encodeURIComponent(movie.title)}`,
                  "_blank"
                );
              }}
            >
              {`${movie.title} (${movie.rate})`}
            </Badge>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          豆瓣热门电视剧
        </h2>
        <div className="flex flex-wrap gap-2">
          {tvs.map((tv) => (
            <Badge
              variant="outline"
              key={tv.id}
              className="cursor-pointer hover:bg-purple-900 hover:text-white px-2 py-1 border-2 border-blue-300 dark:border-gray-700"
              onClick={() => {
                window.open(
                  `/search?keyword=${encodeURIComponent(tv.title)}`,
                  "_blank"
                );
              }}
            >
              {`${tv.title} (${tv.rating.value})`}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};
