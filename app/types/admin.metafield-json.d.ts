/**
 * @description Web Pixel settings accepts only single_line_text
 */
export type WebPixelSettingEventValidation = 'true' | 'false'
export interface MetafieldWebPixelSettingsJsonValue {
    
    ph_project_api_key: string;
    /**
     * @description Web Pixel settings accepts only single_line_text (String). cannot set boolean.
     */
    cart_viewed: WebPixelSettingEventValidation;
     /**
     * @description Web Pixel settings accepts only single_line_text (String). cannot set boolean.
     */
    checkout_address_info_submitted: WebPixelSettingEventValidation,
     /**
     * @description Web Pixel settings accepts only single_line_text (String). cannot set boolean.
     */
    checkout_completed: WebPixelSettingEventValidation,
     /**
     * @description Web Pixel settings accepts only single_line_text (String). cannot set boolean.
     */
    checkout_contact_info_submitted: WebPixelSettingEventValidation,
     /**
     * @description Web Pixel settings accepts only single_line_text (String). cannot set boolean.
     */
    checkout_shipping_info_submitted: WebPixelSettingEventValidation,
     /**
     * @description Web Pixel settings accepts only single_line_text (String). cannot set boolean.
     */
    checkout_started: WebPixelSettingEventValidation,
     /**
     * @description Web Pixel settings accepts only single_line_text (String). cannot set boolean.
     */
    collection_viewed: WebPixelSettingEventValidation,
     /**
     * @description Web Pixel settings accepts only single_line_text (String). cannot set boolean.
     */
    page_viewed: WebPixelSettingEventValidation,
     /**
     * @description Web Pixel settings accepts only single_line_text (String). cannot set boolean.
     */
    payment_info_submitted: WebPixelSettingEventValidation,
     /**
     * @description Web Pixel settings accepts only single_line_text (String). cannot set boolean.
     */
    product_added_to_cart: WebPixelSettingEventValidation,
     /**
     * @description Web Pixel settings accepts only single_line_text (String). cannot set boolean.
     */
    product_removed_from: WebPixelSettingEventValidation,
     /**
     * @description Web Pixel settings accepts only single_line_text (String). cannot set boolean.
     */
    product_viewed: WebPixelSettingEventValidation,
     /**
     * @description Web Pixel settings accepts only single_line_text (String). cannot set boolean.
     */
    search_submitted: WebPixelSettingEventValidation,
     /**
     * @description Web Pixel settings accepts only single_line_text (String). cannot set boolean.
     */
    clicked: WebPixelSettingEventValidation,
     /**
     * @description Web Pixel settings accepts only single_line_text (String). cannot set boolean.
     */
    input_blurred: WebPixelSettingEventValidation,
     /**
     * @description Web Pixel settings accepts only single_line_text (String). cannot set boolean.
     */
    input_changed: WebPixelSettingEventValidation,
     /**
     * @description Web Pixel settings accepts only single_line_text (String). cannot set boolean.
     */
    input_focused: WebPixelSettingEventValidation
    [key: string]: string | undefined;
}