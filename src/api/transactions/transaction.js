import {URL_API} from '../config.js';




  export const getTransactions = async (token) => {
    const res = await fetch(`${URL_API}/my-transactions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    return { ok: res.ok, data };
  };