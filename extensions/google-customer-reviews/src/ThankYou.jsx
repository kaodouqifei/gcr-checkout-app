import '@shopify/ui-extensions/preact';
import {render} from "preact";

export default async () => {
  render(<ThankYouExtension />, document.body)
};

function ThankYouExtension() {
  const orderConfirmation = shopify.orderConfirmation?.value;
  const buyerIdentity = shopify.buyerIdentity;
  const localization = shopify.localization?.value;
  const settings = shopify.settings?.value;

  if (!orderConfirmation?.number) {
    return null;
  }

  const orderId = orderConfirmation.number;
  const email = buyerIdentity?.email?.value;
  const countryCode = localization?.country?.isoCode;

  const defaultDeliveryDays = settings?.default_delivery_days ?? 7;
  const useProductMetafield = settings?.use_product_metafield_for_delivery ?? false;

  let deliveryDays = defaultDeliveryDays;

  if (useProductMetafield) {
    const maxDaysFromMetafields = getMaxDaysFromProductMetafields();
    if (maxDaysFromMetafields > 0) {
      deliveryDays = maxDaysFromMetafields;
    }
  }

  const deliveryDate = calculateDeliveryDate(deliveryDays);

  const params = new URLSearchParams();
  params.set('order_id', orderId);
  if (email) {
    params.set('email', email);
  }
  if (countryCode) {
    params.set('country', countryCode);
  }
  params.set('delivery_date', deliveryDate);

  const reviewsUrl = `/pages/google-customer-reviews?${params.toString()}`;

  const bannerHeading = String(settings?.banner_heading || "Google Customer Reviews");
  const promptText = String(settings?.prompt_text || "Help us improve by sharing your feedback about your purchase experience!");
  const linkText = String(settings?.link_text || "Leave a Review");

  const promptLines = promptText.split('\n').filter(line => line.trim());

  return (
    <s-banner heading={bannerHeading}>
      <s-stack gap="base">
        <s-stack gap="small">
          {promptLines.map((line, index) => (
            <s-text key={index}>{line}</s-text>
          ))}
        </s-stack>
        <s-link href={reviewsUrl} target="_blank">
          {linkText}
        </s-link>
      </s-stack>
    </s-banner>
  );
}

function getMaxDaysFromProductMetafields() {
  const appMetafields = shopify.appMetafields?.value || [];

  const productMetafields = appMetafields.filter(
    (entry) =>
      entry.target?.type === "product" &&
      entry.metafield?.namespace === "custom" &&
      entry.metafield?.key === "expected_arrival_range"
  );

  if (productMetafields.length === 0) {
    return 0;
  }

  let maxValue = 0;

  for (const entry of productMetafields) {
    try {
      const value = entry.metafield?.value;
      if (!value) continue;
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        const localMax = Math.max(...parsed);
        if (localMax > maxValue) {
          maxValue = localMax;
        }
      }
    } catch (e) {
      console.warn("Failed to parse expected_arrival_range metafield:", e);
    }
  }

  return maxValue;
}

function calculateDeliveryDate(defaultDays) {
  const date = new Date();
  date.setDate(date.getDate() + defaultDays);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
