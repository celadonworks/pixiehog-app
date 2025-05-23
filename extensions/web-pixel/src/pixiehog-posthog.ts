import { PostHog } from 'posthog-node';
/* import { version } from '../package.json';
 */
export class PixieHogPostHog extends PostHog {
  getLibraryId(): string {
    return 'pixiehog';
  }
  getLibraryVersion(): string {
    return '1.0.5';
  }
  getCustomUserAgent(): string {
    return `${super.getLibraryId()}/${super.getLibraryVersion()}`
  }

  protected getCustomHeaders(): { [key: string]: string; } {
    const base = super.getCustomHeaders();
    // remove user-agent so client side CORS request headers matches server response
    //Access-Control-Request-Headers: content-type, [X] user-agent
    delete base['User-Agent']
    return base;
  }
}
