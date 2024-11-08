import { JsWebPosthogConfigSchema } from 'common/dto/js-web-settings.dto';
import type { JsWebPosthogSettingChoice } from './interface/setting-row.interface';
import { SettingType } from '../../../common/interfaces/feature-settings.interface';


export const defaultJsWebPosthogSettings: JsWebPosthogSettingChoice[] = Object.entries(JsWebPosthogConfigSchema.shape).map<JsWebPosthogSettingChoice>(([key,item]) =>{
  let testingItem: any = item
  const defaultValue = testingItem._def.defaultValue()

  
  while( testingItem.isOptional() || testingItem.isNullable()){
    testingItem = testingItem._def.innerType
  }
  const types = {
    ZodEnum: SettingType.Select,
    ZodString: SettingType.Text,
    ZodNumber: SettingType.Number,
    ZodBoolean: SettingType.Checkbox,
    ZodArray: SettingType.List
  } as const;
  

  
  if(testingItem._def.typeName == "ZodEnum"){
    return {
      key: key,
      description: testingItem._def.description || '',
      filteredOut: false,
      type: types[testingItem._def.typeName as unknown as keyof typeof types] as SettingType,
      value: defaultValue,
      selectOptions: testingItem._def.values,
    } as JsWebPosthogSettingChoice
  }
  return {
    key: key,
    description: testingItem._def.description || '',
    filteredOut: false,
    type: types[testingItem._def.typeName as unknown as keyof typeof types] as SettingType,
    value: defaultValue,

  } as JsWebPosthogSettingChoice
  }) as JsWebPosthogSettingChoice[]
    
/* export const defaultJsWebPosthogSettings: JsWebPosthogSettingChoice[] = [
  {
    key: 'api_host',
    description: 'URL of your PostHog instance.',
    filteredOut: false,
    type: 'Text',
    value: '',
  },
  {
    key: 'ui_host',
    description: JsWebPosthogConfigSchema.shape.ui_host._def.description as string,
    filteredOut: false,
    type: 'Select',
    selectOptions: JsWebPosthogConfigSchema.shape.ui_host._def.innerType._def.innerType.options,
    value: JsWebPosthogConfigSchema.shape.ui_host._def.defaultValue() as string,
  },
  {
    key: 'capture_pageview',
    description:
      "Determines if PostHog should automatically capture 'pageview' events. web pixel page_viewed event is recommended.",
    value: false,
    filteredOut: false,
    type: 'Checkbox',
  },
  {
    key: 'capture_pageleave',
    description: "Determines if PostHog should automatically capture 'pageleave' events.",
    value: false,
    filteredOut: false,
    type: 'Checkbox',
  },
  {
    key: 'cross_subdomain_cookie',
    description:
      "Determines if cookie should be set on the top level domain (example.com). If PostHog-js is loaded on a subdomain (test.example.com), and cross_subdomain_cookie is set to false, it'll set the cookie on the subdomain only (test.example.com).",
    value: false,
    filteredOut: false,
    type: 'Checkbox',
  },
  {
    key: 'disable_persistence',
    description:
      'Disable persisting user data across pages. This will disable cookies, session storage and local storage.',
    value: false,
    filteredOut: false,
    type: 'Checkbox',
  },
  {
    key: 'disable_surveys',
    description:
      'Determines if surveys script should load which controls whether they show up for users, and whether requests for API surveys return valid data',
    value: false,
    filteredOut: false,
    type: 'Checkbox',
  },
  {
    key: 'disable_session_recording',
    description: 'Determines if users should be opted out of session recording.',
    value: false,
    filteredOut: false,
    type: 'Checkbox',
  },
  {
    key: 'enable_recording_console_log',
    description: 'Determines if console logs should be recorded as part of the session recording.',
    value: false,
    filteredOut: false,
    type: 'Checkbox',
  },
  {
    key: 'enable_heatmaps',
    description: 'Determines if heatmap data should be captured.',
    value: false,
    filteredOut: false,
    type: 'Checkbox',
  },
  {
    key: 'mask_all_text',
    description: 'Prevent PostHog autocapture from capturing any text from your elements.',
    value: false,
    filteredOut: false,
    type: 'Checkbox',
  },
  {
    key: 'mask_all_element_attributes',
    description: 'Prevent PostHog autocapture from capturing any attributes from your elements.',
    value: false,
    filteredOut: false,
    type: 'Checkbox',
  },
  {
    key: 'opt_out_capturing_by_default',
    description:
      "Determines if users should be opted out of PostHog tracking by default, requiring additional logic to opt them into capturing by calling 'posthog.opt_in_capturing'.",
    value: false,
    filteredOut: false,
    type: 'Checkbox',
  },
  {
    key: 'opt_out_persistence_by_default',
    description:
      "Determines if users should be opted out of browser data storage by this PostHog instance by default, requiring additional logic to opt them into capturing by calling 'posthog.opt_in_capturing().",
    value: false,
    filteredOut: false,
    type: 'Checkbox',
  },
  {
    key: 'persistence',
    description: 'Determines how PostHog stores information about the user. See persistence for details.',
    filteredOut: false,
    type: 'Select',
    selectOptions: ['localStorage+cookie', 'localStorage', 'sessionStorage', 'cookie', 'memory'],
    value: 'localStorage+cookie'
  },
  {
    key: 'property_denylist',
    description: "A list of properties that should never be sent with 'capture' calls.",
    filteredOut: false,
    type: 'List',
    value: []
  },
  {
    key: 'person_profiles',
    description: 'Set whether events should capture identified events and process person profiles',
    filteredOut: false,
    type: 'Select',
    selectOptions: ['always', 'identified_only'],
    value: 'always'
  },
  {
    key: 'session_idle_timeout_seconds',
    description: 'The maximum amount of time a session can be inactive before it is split into a new session.',
    filteredOut: false,
    type: 'Number',
    value: 1800
  },
  {
    key: 'advanced_disable_decide',
    description: "Will completely disable the '/decide' endpoint request (and features that rely on it).",
    value: false,
    filteredOut: false,
    type: 'Checkbox',
  },
  {
    key: 'advanced_disable_feature_flags',
    description: "Will keep '/decide' running, but without any feature flag requests",
    value: false,
    filteredOut: false,
    type: 'Checkbox',
  },
  {
    key: 'advanced_disable_feature_flags_on_first_load',
    description:
      'Stops from firing feature flag requests on first page load. Only requests feature flags when user identity or properties are updated, or you manually request for flags to be loaded.',
    value: false,
    filteredOut: false,
    type: 'Checkbox',
  },
  {
    key: 'feature_flag_request_timeout_ms',
    description: 'Sets timeout for fetching feature flags',
    filteredOut: false,
    value: 3000,
    type: 'Number',
  },
  {
    key: 'secure_cookie',
    description:
      "If this is 'true', PostHog cookies will be marked as secure, meaning they will only be transmitted over HTTPS.",
    value: false,
    filteredOut: false,
    type: 'Checkbox',
  },
  {
    key: 'custom_campaign_params',
    description: 'List of query params to be automatically captured.',
    filteredOut: false,
    type: 'List',
    value: []
  },
]; */
