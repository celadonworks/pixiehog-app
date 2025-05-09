import { PostHog } from 'posthog-node';
/* import { version } from '../package.json';
 */
export class PixieHogPostHog extends PostHog {
  getLibraryId(): string {
    return 'pixiehog';
  }
  getLibraryVersion(): string {
    return '1.0.4';
  }
  getCustomUserAgent(): string {
    return `${super.getLibraryId()}/${super.getLibraryVersion()}`
  }
}
