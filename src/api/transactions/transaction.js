import axios from "axios";
export const getTransactions = async (token) => {
    return await axios.get("http://localhost:8000/api/my-transactions", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };