

export const verify_turnstile = async (token) => {
    const res = await fetch("http://192.168.1.65:8000/api/verify-turnstile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
  
    const data = await res.json();
    return data;
  };