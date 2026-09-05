export function customerEventProperties(customer: object | null | undefined, anonymous: boolean) {
  return anonymous ? {} : customer ?? {};
}
