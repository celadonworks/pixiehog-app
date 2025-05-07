export const CAMPAIGN_PARAMS = [
  'gclid', // google ads
  'gclsrc', // google ads 360
  'dclid', // google display ads
  'gbraid', // google ads, web to app
  'wbraid', // google ads, app to web
  'fbclid', // facebook
  'msclkid', // microsoft
  'twclid', // twitter
  'li_fat_id', // linkedin
  'igshid', // instagram
  'ttclid', // tiktok
  'rdt_cid', // reddit
  'epik', // pinterest
  'qclid', // quora
  'sccid', // snapchat
  'irclid', // impact
  '_kx', // klaviyo
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'gad_source', // google ads source
  'mc_cid', // mailchimp campaign id
]


export function calculateCampaignParams(url: string) {
  const urlObj = new URL(url);
  const searchParams = urlObj.searchParams;
  const firstTouchCampaignParams = Object.fromEntries(CAMPAIGN_PARAMS.map((param) => [`$initial_${param}`, searchParams.get(param)]))
  const lastTouchCampaignParams = Object.fromEntries(CAMPAIGN_PARAMS.map((param) => [`$${param}`, searchParams.get(param)]))
  return {firstTouchCampaignParams, lastTouchCampaignParams}
}