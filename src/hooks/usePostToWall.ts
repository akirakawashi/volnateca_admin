import { postToWall } from '../api/wall_post';
import type { PostToWallPayload, PostedToWall } from '../types/wall_post';
import { useAsyncAction } from './useAsyncAction';

interface UsePostToWallResult {
  post: (payload: PostToWallPayload) => Promise<PostedToWall | null>;
  loading: boolean;
  error: string | null;
  result: PostedToWall | null;
  reset: () => void;
}

export function usePostToWall(): UsePostToWallResult {
  const { run: post, loading, error, result, reset } = useAsyncAction(postToWall);

  return { post, loading, error, result, reset };
}
