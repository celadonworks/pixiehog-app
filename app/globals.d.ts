declare module '*.css';
declare global {
  interface Window {
    ENV: {
      POSTHOG_API_KEY: string;
      POSTOHG_API_HOST: string;
      APP_POSTHOG_JS_WEB_THEME_APP_UUID: string;
    };
  }
}

export {}