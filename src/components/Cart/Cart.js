import { useEffect, useState } from "react";
import { createPayment, checkTransactionStatus } from "../../api/payment/payment";


export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(stored);
  }, []);

  const removeFromCart = (id) => {
    const updated = cartItems.filter(item => item.id !== id);
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const data = await createPayment(total);
      console.log("📦 Dữ liệu thanh toán:", data);
  
      localStorage.setItem("momo_orderId", data.orderId);
      localStorage.setItem("momo_requestId", data.requestId);
  
      if (data.payUrl) {
        setTimeout(() => {
          window.location.href = data.payUrl;
        }, 300);
      } else {
        alert("Không thể tạo link thanh toán.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Lỗi khi gọi API thanh toán.");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const fetchStatus = async () => {
      const orderId = localStorage.getItem("momo_orderId");
      const requestId = localStorage.getItem("momo_requestId");
      const token = localStorage.getItem("access_token");
  
      if (!orderId || !requestId) {
        console.warn("Thiếu thông tin giao dịch");
        return;
      }
  
      try {
        const status = await checkTransactionStatus({ orderId, requestId, token });
        console.log("📦 Trạng thái giao dịch:", status);
  
        if (status.resultCode === 0) {
          setTransactionStatus("success");
          setStatusMessage("✅ Thanh toán thành công!");
          localStorage.removeItem("momo_orderId");
          localStorage.removeItem("momo_requestId");
          localStorage.removeItem("cart"); // 👈 nếu muốn xóa luôn giỏ
        } else {
          setTransactionStatus("failed");
          setStatusMessage("❌ Thanh toán thất bại hoặc bị hủy.");
        }
      } catch (error) {
        console.error("Lỗi kiểm tra trạng thái giao dịch:", error);
      }
    };
  
    fetchStatus();
  }, []);
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">🛒 Giỏ hàng của bạn</h1>
      {transactionStatus && (
        <div
            className={`p-3 rounded text-white ${
            transactionStatus === "success" ? "bg-green-500" : "bg-red-500"
            }`}
        >
            {statusMessage}
        </div>
        )}
      {cartItems.length === 0 ? (
        <p>Giỏ hàng trống.</p>
      ) : (
        <div className="space-y-4">
          {cartItems.map(item => (
            <div key={item.id} className="flex items-center justify-between border p-3 rounded">
              <div>
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p>{item.quantity} x {Number(item.price).toLocaleString()} đ</p>
              </div>
              <button
                className="bg-red-500 text-white px-3 py-1 rounded"
                onClick={() => removeFromCart(item.id)}
              >
                Xóa
              </button>
            </div>
          ))}

          <div className="text-right font-bold text-lg">
            Tổng: {total.toLocaleString()} đ
          </div>

          <div className="text-right">
            <button
              className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Thanh toán với MoMo"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
