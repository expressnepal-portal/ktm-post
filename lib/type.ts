import { Post } from "./wordpress";

export type Category = {
  nepali:string,
  english:string,
  slug:string
};

export  interface HomePagePosts {
  featured: Post[];
  trending: Post[];
  latest: Post[];
  politics:Post[];
  society:Post[];
  breaking:Post[];
  economy:Post[];
  technology:Post[];
  arts:Post[];
  sports:Post[];
  world:Post[];
  podcast:Post[];
  multimedia?:Post[];
  international?:Post[];
  opinion?:Post[];
  legal?:Post[];
  health?:Post[];
}


export interface BreakingNewsType{
  title: string;
  slug: string;
  image?: string;
  excerpt?: string;
}

export type CardType = {
  title:string,
  content:string,
  images:string[],
  link:string
}

export interface BannerAd {
  id: string;                 // unique identifier
  title: string;  
  adTitle:string;            // admin reference
  slug?: string;              // optional, for dynamic routes
  category?: string;          // optional, filtering
  adImage?: string;           // image URL
  link?: string;              // clickable link
  priority?: number;          // optional, for ordering
  active?: boolean;           // enable/disable
}

