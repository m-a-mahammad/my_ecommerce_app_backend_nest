export interface PaymobResponseItf {
  id: string;
  client_secret: string;
  payment_keys: {
    integration: number;
    key: string;
    gateway_type: string;
    iframe_id: string;
  }[];
  intention_detail: {
    amount: number;
    currency: string;
    items: {
      name: string;
      amount: number;
      description: string;
      quantity: number;
    }[];
  };
  payment_methods: {
    integration_id: number;
    name: string;
    method_type: string;
    currency: string;
    live: boolean;
    alias: string;
  }[];
  status: string;
  created: string;
  confirmed: boolean;
  object: string;
}
