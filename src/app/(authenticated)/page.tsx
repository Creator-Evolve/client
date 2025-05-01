"use client"
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const PayPalButton = () => {
  const initialOptions = {
    clientId: "AbYmrZmPQAz44BrT9nfS4qUx0piq87Y021iBTh-WhVIwuGdu_6202rrLFSl4z1x1J3SimaglpBb9Vi9z",
    vault: false,
    intent: "subscription"
  };

  return (
    <PayPalScriptProvider options={{ ...initialOptions}}>
      <PayPalButtons
        style={{
          layout: "vertical",
          color: "blue",
          shape: "rect",
          label: "subscribe"
        }}
        createSubscription={(data, actions) => {
          return actions.subscription.create({
            plan_id: "P-7K412636C37748815M6HFKVY"
          });
        }}
        onApprove={async (data, actions) => {
          console.log("Subscription successful!", data.subscriptionID);
          // Here you can add code to handle the successful subscription
          // For example, make an API call to your backend to store the subscriptionID
          return alert("You have successfully created subscription " + data.subscriptionID);
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalButton;
