import {URL_API} from '../config.js';
//const URL_API = "http://160.30.21.53:8000/api";


export const login = async (email, password) => {
    const res = await fetch(`${URL_API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: email, password }),
    });
    const data = await res.json();
    return { ok: res.ok, data };
  };
  

export const whoami = async (token) => {
  const res = await fetch(`${URL_API}/whoami`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  return { ok: res.ok, data };
};

export const googleLogin = async (googleToken) => {
  const res = await fetch(`${URL_API}/google-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: googleToken }),
  });
  return res.json();
};