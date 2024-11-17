declare module '*.css';
declare global {
  interface Window {
    ENV: {
      POSTHOG_API_KEY: string;
      POSTOHG_API_HOST: string;
    };
  }
}

export {}