import { AxiosRequestConfig } from 'axios';

import { apiClient } from './apiClient';
import { AnnotationsSearchResponse, SearchMetadata } from './types';

interface SessionMetadata extends SearchMetadata {
  search_id: string;
  page: number;
  page_size: number;
  total_pages: number;
  generated_through_page: number;
  expires_at: string;
}
export interface SessionPage extends AnnotationsSearchResponse {
  meta: SessionMetadata;
}
export interface SessionPending {
  status: 'preparing';
  count: number;
  meta: SessionMetadata;
}
export type SessionResponse = SessionPage | SessionPending;

export function retryDelay(value: unknown): number {
  if (value === undefined || value === null) return 1000;
  const seconds = Number(value);
  const delay = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(String(value)) - Date.now();
  return Number.isFinite(delay) ? Math.min(300000, Math.max(1000, delay)) : 1000;
}

export async function sessionRequest(config: AxiosRequestConfig) {
  const response = await apiClient<SessionResponse>({ timeout: 60000, ...config });
  return { data: response.data, retryAfter: retryDelay(response.headers['retry-after']) };
}

export function waitForPoll(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const cancel = () => {
      clearTimeout(timer);
      signal.removeEventListener('abort', cancel);
      reject(new DOMException('Search cancelled', 'AbortError'));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', cancel);
      resolve();
    }, ms);
    signal.addEventListener('abort', cancel, { once: true });
    if (signal.aborted) cancel();
  });
}
