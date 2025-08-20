export type DoubanMovieItem = {
  episodes_info: string;
  rate: string;
  cover_x: number;
  title: string;
  url: string;
  playable: boolean;
  cover: string;
  id: string;
  cover_y: number;
  is_new: boolean;
};

export type DoubanTVItem = {
  rating: {
    count: number;
    max: number;
    star_count: number;
    value: number;
  };
  title: string;
  pic: {
    large: string;
    normal: string;
  };
  is_new: boolean;
  uri: string;
  episodes_info: string;
  card_subtitle: string;
  type: string;
  id: string;
};
