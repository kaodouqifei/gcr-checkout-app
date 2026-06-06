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

  const defaultDeliveryDays = settings?.default_delivery_days || 7;
  const deliveryDate = calculateDeliveryDate(countryCode, defaultDeliveryDays);

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

  return (
    <s-banner heading={shopify.i18n.translate("reviewHeading")}>
      <s-stack gap="base">
        <s-text>
          {shopify.i18n.translate("reviewPrompt")}
        </s-text>
        <s-link href={reviewsUrl} target="_blank">
          {shopify.i18n.translate("leaveReview")}
        </s-link>
      </s-stack>
    </s-banner>
  );
}

function calculateDeliveryDate(countryCode, defaultDays) {
  const countryDeliveryMap = {
    'US': 5,
    'CA': 7,
    'GB': 5,
    'DE': 5,
    'FR': 5,
    'AU': 10,
    'JP': 7,
    'CN': 7,
  };

  const days = countryDeliveryMap[countryCode] || defaultDays;
  const date = new Date();
  date.setDate(date.getDate() + days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
