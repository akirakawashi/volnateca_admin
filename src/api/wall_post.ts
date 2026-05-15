import { apiFetch } from './client';
import type { PostToWallPayload, PostedToWall } from '../types/wall_post';

export function postToWall(payload: PostToWallPayload): Promise<PostedToWall> {
  return apiFetch<PostedToWall>('/v1/admin/wall', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function uploadWallPhoto(url: string): Promise<string> {
  const data = await apiFetch<{ attachment: string }>('/v1/admin/wall/photo', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
  return data.attachment;
}
