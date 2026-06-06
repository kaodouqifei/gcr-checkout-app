import '@shopify/ui-extensions/preact';
import {render} from "preact";

// 1. Export the extension
export default async () => {
  render(<Extension />, document.body)
};

function Extension() {
  // 2. Check instructions for feature availability
  if (!shopify.instructions.value.metafields.canSetCartMetafields) {
    return (
      <s-banner heading="google-customer-reviews" tone="warning">
        Cart metafield changes are not supported in this checkout
      </s-banner>
    );
  }

  const freeGiftRequested = shopify.appMetafields.value.find(
    (appMetafield) =>
      appMetafield.target.type === "cart" &&
      appMetafield.metafield.namespace === "$app" &&
      appMetafield.metafield.key === "requestedFreeGift",
  );

  // 3. Render a UI
  return (
    <s-banner heading="google-customer-reviews">
      <s-stack gap="base">
        <s-text>
          Welcome to the <s-text type="emphasis">{shopify.extension.target}</s-text> extension!
        </s-text>
        <s-checkbox
          checked={freeGiftRequested?.metafield?.value === "true"}
          onChange={onCheckboxChange}
          label="I would like to receive a free gift with my order"
        />
      </s-stack>
    </s-banner>
  );

  async function onCheckboxChange(event) {
    const isChecked = event.target.checked;
    // 4. Call the API to modify checkout
    const result = await shopify.applyMetafieldChange({
      type: "updateCartMetafield",
      metafield: {
        namespace: "$app",
        key: "requestedFreeGift",
        value: isChecked ? "true" : "false",
        type: "boolean",
      },
    });
    console.log("applyMetafieldChange result", result);
  }
}