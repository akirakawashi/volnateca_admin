export interface PostToWallPayload {
  message: string;
  like_points: number;
  repost_points: number;
  comment_points: number;
  week_number: number | null;
  attachments: string[];
}

export interface PostedToWall {
  post_id: number;
  external_id: string;
  like_tasks_id: number | null;
  repost_tasks_id: number | null;
  comment_tasks_id: number | null;
}
