import { URL_API } from '../config.js';

export const createPayment = async (amount) => {
  const response = await fetch(`${URL_API}/create-payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ amount })
  });
  return await response.json();
};

export const checkTransactionStatus = async ({ orderId, requestId, token }) => {
  const res = await fetch(`${URL_API}/transaction-status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: JSON.stringify({ orderId, requestId })
  });
  return await res.json();
};
