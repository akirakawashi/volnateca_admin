export type BroadcastStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface BroadcastSnapshot {
  broadcast_id: string;
  status: BroadcastStatus;
  message: string;
  target_total: number | null;
  processed_total: number;
  sent_total: number;
  failed_total: number;
  started_at: string | null;
  finished_at: string | null;
  error: string | null;
}

export interface BroadcastStartPayload {
  message: string;
}
