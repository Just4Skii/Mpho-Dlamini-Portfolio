// Analytics-ready event names — no data is sent in this frontend demo.
// When a backend/analytics provider is added, call track(event, props).

export type AnalyticsEvent =
  | "product_viewed"
  | "search_started"
  | "search_completed"
  | "filter_applied"
  | "product_added_to_cart"
  | "wishlist_added"
  | "checkout_started"
  | "checkout_step_completed"
  | "coupon_applied"
  | "checkout_completed"
  | "brand_viewed"
  | "guide_opened"
  | "seller_application_started";

export function track(event: AnalyticsEvent, props?: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.debug(`[analytics] ${event}`, props);
  }
  // In production, forward to your analytics provider here.
  // Example: window.gtag?.('event', event, props);
}
