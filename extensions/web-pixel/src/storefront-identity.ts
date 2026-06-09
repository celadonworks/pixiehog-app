import type { Attribute } from '@shopify/web-pixels-extension';

const STOREFRONT_POSTHOG_DISTINCT_ID_ATTRIBUTE = '_posthog_distinct_id';

type CheckoutLike = {
  attributes?: Attribute[] | null;
  customer?: unknown;
  email?: string | null;
  order?: unknown;
};

export function getStorefrontPostHogDistinctId(checkout?: CheckoutLike | null) {
  let attribute = checkout?.attributes?.find(
    ({ key }) => key === STOREFRONT_POSTHOG_DISTINCT_ID_ATTRIBUTE,
  );
  return getNonEmptyString(attribute?.value);
}

export function getCheckoutPersonProperties(checkout?: CheckoutLike | null) {
  let customer = getCheckoutCustomer(checkout);
  let email = getNonEmptyString(
    checkout?.email ?? getRecordString(customer, 'email'),
  );
  if (!email) {
    return undefined;
  }

  return {
    ...getCustomerProperties(customer),
    email,
  };
}

function getCheckoutCustomer(checkout?: CheckoutLike | null) {
  let directCustomer = getRecord(checkout?.customer);
  if (directCustomer) {
    return directCustomer;
  }

  return getRecord(getRecord(checkout?.order)?.customer);
}

function getCustomerProperties(customer: Record<string, unknown> | undefined) {
  if (!customer) {
    return {};
  }

  return customer;
}

function getRecord(value: unknown) {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : undefined;
}

function getRecordString(
  record: Record<string, unknown> | undefined,
  key: string,
) {
  return getNonEmptyString(record?.[key]);
}

function getNonEmptyString(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0
    ? value
    : undefined;
}
