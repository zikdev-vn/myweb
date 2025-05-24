export const createPayment = async (amount) => {
    const response = await fetch("http://localhost:8000/api/create-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ amount })
    });
    return await response.json();
  };
  
  export const checkTransactionStatus = async ({ orderId, requestId, token }) => {
    const res = await fetch("http://localhost:8000/api/transaction-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify({ orderId, requestId })
    });
    return await res.json();
  };