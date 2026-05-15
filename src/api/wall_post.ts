import { apiFetch } from './client';
import type { PostToWallPayload, PostedToWall } from '../types/wall_post';

export function postToWall(payload: PostToWallPayload): Promise<PostedToWall> {
  return apiFetch<PostedToWall>('/v1/admin/wall', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
