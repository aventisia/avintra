// Response from the success handler
export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_subscription_id?: string;
  razorpay_signature: string;
}

// Response from the failure handler
export interface RazorpayErrorResponse {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: {
      order_id: string;
      payment_id: string;
    };
  };
}

// Options object to initialize Razorpay
export interface RazorpayOptions {
  // API Key ID generated from the Dashboard.
  key: string;
  subscription_id?: string;
  order_id?: string;
  name: string;
  description: string;
  image?: string;
  handler: (response: RazorpaySuccessResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  //   object Set of key-value pairs that can be used to store additional information about the payment. It can hold a maximum of 15 key-value pairs, each 256 characters long
  notes?: {
    [key: string]: string | number | unknown;
  };
  theme?: {
    color?: string;
  };
}

// Augment the global Window object
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: "payment.failed", callback: (response: RazorpayErrorResponse) => void) => void;
    };
  }
}
