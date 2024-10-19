
export type WebPixelSettingEventValidation = 'true' | 'false'
export interface WebPixelSettings {
    ph_project_api_key: string;
    cart_viewed: WebPixelSettingEventValidation;
    checkout_address_info_submitted: WebPixelSettingEventValidation,
    checkout_completed: WebPixelSettingEventValidation,
    checkout_contact_info_submitted: WebPixelSettingEventValidation,
    checkout_shipping_info_submitted: WebPixelSettingEventValidation,
    checkout_started: WebPixelSettingEventValidation,
    collection_viewed: WebPixelSettingEventValidation,
    page_viewed: WebPixelSettingEventValidation,
    payment_info_submitted: WebPixelSettingEventValidation,
    product_added_to_cart: WebPixelSettingEventValidation,
    product_removed_from: WebPixelSettingEventValidation,
    product_viewed: WebPixelSettingEventValidation,
    search_submitted: WebPixelSettingEventValidation,
    clicked: WebPixelSettingEventValidation,
    input_blurred: WebPixelSettingEventValidation,
    input_changed: WebPixelSettingEventValidation,
    input_focused: WebPixelSettingEventValidation
    [key: string]: string | undefined;
}