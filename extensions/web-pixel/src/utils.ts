
//from https://github.com/PostHog/posthog-js/blob/main/src/utils/event-utils.ts
const URL_REGEX_PREFIX = 'https?://(.*)'
export function getSearchEngine(referrer: string | null): string | null {
  if (!referrer) {
      return null
  } else {
      if (referrer.search(URL_REGEX_PREFIX + 'google.([^/?]*)') === 0) {
          return 'google'
      } else if (referrer.search(URL_REGEX_PREFIX + 'bing.com') === 0) {
          return 'bing'
      } else if (referrer.search(URL_REGEX_PREFIX + 'yahoo.com') === 0) {
          return 'yahoo'
      } else if (referrer.search(URL_REGEX_PREFIX + 'duckduckgo.com') === 0) {
          return 'duckduckgo'
      } else {
          return null
      }
  }
}