import PostHog from 'posthog-js-lite'
/* import { version } from '../package.json';
 */
export class PixieHogPostHog extends PostHog {

  getLibraryId(): string {
    return 'pixiehog';
  }
  getLibraryVersion(): string {
    return '1.0.6';
  }

  getCommonEventProperties() {
    return {
      $lib: this.getLibraryId(),
      $lib_version: this.getLibraryVersion(),
    }
  }
  getCustomUserAgent(): string {
    return `${super.getLibraryId()}/${super.getLibraryVersion()}`
  }

  public async captureStatelessPublic(...args: Parameters<PostHog['captureStateless']>
  ): Promise<void> {
    return super.captureStateless(...args)
  }

  protected getCustomHeaders(): { [key: string]: string; } {
    const base = super.getCustomHeaders();
    // remove user-agent so client side CORS request headers matches server response
    //Access-Control-Request-Headers: content-type, [X] user-agent
    delete base['User-Agent']
    return base;
  }
}
