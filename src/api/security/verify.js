import {URL_API} from '../config.js';



 export const verify_turnstile = async (token) => {
   const res = await fetch(`${URL_API}/verify-turnstile`, {
     headers: {
        method: "POST",
        "Content-Type": "application/json",
       Authorization: `Bearer ${token}`,
     },
   });
   const data = await res.json();
   return { ok: res.ok, data };
 }; 