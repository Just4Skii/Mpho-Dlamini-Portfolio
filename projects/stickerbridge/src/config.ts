export const APK_URL = 'https://github.com/Just4Skii/StickerBridge/raw/main/stickerbridge.apk';
export const REPO_URL = 'https://github.com/Just4Skii/StickerBridge';
export const APP_VERSION = 'v1.0.0';
export const APP_SIZE = '~20 MB';

export function getPortfolioReturnUrl(): string {
  if (typeof window === 'undefined') return '/work';
  const pathname = window.location.pathname;
  const match = pathname.match(/^(\/[^\/]+)\/work/i);
  if (match && match[1]) {
    return `${match[1]}/work`;
  }
  return '/work';
}
