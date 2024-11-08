import { z } from 'zod';
export const JsWebPosthogConfigSchema = z.object({
  /* api_host: z.string().describe('URL of your PostHog instance.').trim().url().nullish().default(''), */

  ui_host: z
    .enum(['https://us.posthog.com', 'https://eu.posthog.com'])
    .describe(
      `If using a reverse proxy for 'api_host' then this should be the actual PostHog app URL (e.g. https://us.posthog.com). This ensures that links to PostHog point to the correct host.`
    )
    .nullable()
    .default("https://us.posthog.com"),

  // set app's default to false because web pixel is recommended
  capture_pageview: z
    .boolean()
    .describe(
      `Determines if PostHog should automatically capture 'pageview' events. web pixel page_veiwed event is recommended.`
    )
    .default(false),

  // set app's default to false because web pixel is recommended
  capture_pageleave: z
    .boolean()
    .describe(`Determines if PostHog should automatically capture 'pageleave' events.`)
    .default(false),

  cross_subdomain_cookie: z
    .boolean()
    .describe(
      `Determines if cookie should be set on the top level domain (example.com). If PostHog-js is loaded on a subdomain (test.example.com), and cross_subdomain_cookie is set to false, it'll set the cookie on the subdomain only (test.example.com).`
    )
    .default(true),

  disable_persistence: z
    .boolean()
    .describe(
      `Disable persisting user data across pages. This will disable cookies, session storage and local storage.`
    )
    .default(false),

  disable_surveys: z
    .boolean()
    .describe(
      'Determines if surveys script should load which controls whether they show up for users, and whether requests for API surveys return valid data'
    )
    .default(false),
  disable_session_recording: z
    .boolean()
    .describe('Determines if users should be opted out of session recording.')
    .default(false),

  enable_recording_console_log: z
    .boolean()
    .describe('Determines if console logs should be recorded as part of the session recording. ')
    .default(false),

  enable_heatmaps: z.boolean().nullable().describe('Determines if heatmap data should be captured.').default(null),

  mask_all_text: z
    .boolean()
    .describe('Prevent PostHog autocapture from capturing any text from your elements.')
    .default(false),

  mask_all_element_attributes: z
    .boolean()
    .describe('Prevent PostHog autocapture from capturing any attributes from your elements.')
    .default(false),

  opt_out_capturing_by_default: z
    .boolean()
    .describe(
      `Determines if users should be opted out of PostHog tracking by default, requiring additional logic to opt them into capturing by calling 'posthog.opt_in_capturing'.`
    )
    .default(false),

  opt_out_persistence_by_default: z
    .boolean()
    .describe(
      `Determines if users should be opted out of browser data storage by this PostHog instance by default, requiring additional logic to opt them into capturing by calling 'posthog.opt_in_capturing().`
    )
    .default(false),

  persistence: z
    .enum(['localStorage', 'sessionStorage', 'cookie', 'memory', 'localStorage+cookie'])
    .describe(`Determines how PostHog stores information about the user. See persistence for details.`)
    .default('localStorage+cookie'),

  property_denylist: z
    .array(z.string().trim())
    .describe(`A list of properties that should never be sent with 'capture' calls.`)
    .default([]),

  person_profiles: z
    .enum(['always', 'identified_only'])
    .describe('Set whether events should capture identified events and process person profiles')
    .default('always'),

  session_idle_timeout_seconds: z
    .number()
    .describe('The maximum amount of time a session can be inactive before it is split into a new session.')
    .default(1800),

  advanced_disable_decide: z
    .boolean()
    .describe(`Will completely disable the '/decide' endpoint request (and features that rely on it).`)
    .default(false),
  advanced_disable_feature_flags: z
    .boolean()
    .describe(`Will keep '/decide' running, but without any feature flag requests`)
    .default(false),

  advanced_disable_feature_flags_on_first_load: z
    .boolean()
    .describe(
      `Stops from firing feature flag requests on first page load. Only requests feature flags when user identity or properties are updated, or you manually request for flags to be loaded.`
    )
    .default(false),

  feature_flag_request_timeout_ms: z.number().describe('Sets timeout for fetching feature flags').default(3000),

  secure_cookie: z
    .boolean()
    .describe(
      `If this is 'true', PostHog cookies will be marked as secure, meaning they will only be transmitted over HTTPS.`
    )
    .default(false),

  custom_campaign_params: z
    .array(z.string())
    .describe(`List of query params to be automatically captured.`)
    .default([]),

  // the following will not be implemented
  /**
   * 
  sanitize_properties: z.unknown().transform(() => null),
  loaded: z.unknown().transform(() => null),
  bootstrap: z.unknown().transform(() => null),
  session_recording: z.unknown().transform(() => null),
  xhr_headers: z.unknown().transform(() => null),
  autocapture: z.unknown().transform(() => null),
  
  'autocapture.url_allowlist': z
    .array(z.string().trim())
    .describe(
      `List of URLs to enable autocapture on, can be string or regex matches e.g. ['https://example.com', 'test.com/.*']. An empty list means no URLs are allowed for capture, unset means all URLS are`
    )
    .nullable()
    .default(null),

  'autocapture.dom_event_allowlist': z
    .array(z.string().trim())
    .describe(
      `An array of DOM events, like 'click', 'change', 'submit', to enable autocapture on. An empty array means no events are enable for capture, unset means all are.`
    )
    .nullable()
    .default(null),

  'autocapture.element_allowlist': z
    .array(z.string().trim())
    .describe(
      `An array of DOM elements, like 'a', 'button', 'form', 'input', 'select', 'textarea', or 'label', to allow autocapture on. An empty array means no elements are enabled for capture, unset means all elements are enabled.`
    )
    .nullable()
    .default(null),

  'autocapture.css_selector_allowlist': z
    .array(z.string().trim())
    .describe(
      'An array of CSS selectors to enable autocapture on. An empty array means no CSS selectors are allowed for capture, unset means all CSS selectors are.'
    )
    .nullable()
    .default(null),

  'autocapture.element_attribute_ignorelist': z
    .array(z.string().trim())
    .describe(
      'An array of element attributes that autocapture will not capture. Both an empty array and unset mean any of the attributes from the element are captured.'
    )
    .nullable()
    .default(null),

  'autocapture.capture_copied_text': z
    .boolean()
    .describe('When set to true, autocapture will capture the text of any element that is cut or copied.')
    .default(false),
  */
});

export type JsWebPosthogConfig = z.infer<typeof JsWebPosthogConfigSchema>;
