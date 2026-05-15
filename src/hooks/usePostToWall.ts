import { useState } from 'react';
import { postToWall } from '../api/wall_post';
import type { PostToWallPayload, PostedToWall } from '../types/wall_post';

interface UsePostToWallResult {
  post: (payload: PostToWallPayload) => Promise<PostedToWall | null>;
  loading: boolean;
  error: string | null;
  result: PostedToWall | null;
  reset: () => void;
}

export function usePostToWall(): UsePostToWallResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PostedToWall | null>(null);

  const post = async (payload: PostToWallPayload): Promise<PostedToWall | null> => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const created = await postToWall(payload);
      setResult(created);
      return created;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setResult(null);
  };

  return { post, loading, error, result, reset };
}
