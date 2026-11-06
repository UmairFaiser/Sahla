export type Post = {
  id: number;
  slug: string;
  title: string;
  body: string;
  created_at: string;
};

export type Reply = {
  id: number;
  post_id: number;
  author_name: string;
  body: string;
  quoted_text: string | null;
  start_offset: number | null;
  end_offset: number | null;
  created_at: string;
};
