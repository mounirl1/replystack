import type { Platform, Tone } from '@replystack/shared';

export interface GenerateReplyPayload {
  review_content: string;
  review_rating: number;
  review_author: string;
  platform: Platform;
  tone?: Tone;
  language?: string;
}

export interface GenerateReplyResponse {
  reply: string;
  tone: Tone;
  language: string;
  tokens_used: number;
  quota_remaining: number | 'unlimited';
}

export async function generateReply(
  payload: GenerateReplyPayload
): Promise<GenerateReplyResponse> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type: 'GENERATE_REPLY', payload },
      (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      }
    );
  });
}

export async function getAuthStatus(): Promise<{
  isLoggedIn: boolean;
  user: { name: string; email: string; quota_remaining: number | 'unlimited' } | null;
}> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'GET_AUTH_STATUS' }, (response) => {
      resolve(response);
    });
  });
}
