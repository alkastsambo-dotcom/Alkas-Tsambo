export const BRAND_LOGO_URL = '/assets/aistudio/1794661876158_210f17d4.jpg';
export const BRAND_DISPLAY_NAME = 'LocatifPro';

export const LIVE_PUBLIC_APP_URL =
  'https://ais-pre-ijvsw5272yozqwt3cwftuc-401641622566.europe-west2.run.app';
export const LIVE_DEV_APP_URL =
  'https://ais-dev-ijvsw5272yozqwt3cwftuc-401641622566.europe-west2.run.app';
export const SUGGESTED_CUSTOM_DOMAIN = 'locatifpro.com';

export const getActiveAppUrl = (): string => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    const origin = window.location.origin;
    if (
      origin.includes('locatifpro') ||
      (!origin.includes('localhost') && !origin.includes('ais-dev-'))
    ) {
      return origin;
    }
  }
  return LIVE_PUBLIC_APP_URL;
};
