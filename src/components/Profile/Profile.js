
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import {  useState , useEffect } from "react";
import { login , whoami , googleLogin } from "../../api/auth/auth";
import {getTransactions} from "../../api/transactions/transaction";
import "./Profile.css";

const Profile = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [showForm, setShowForm] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const token = localStorage.getItem("access_token");
  const [showTransactions, setShowTransactions] = useState(false);


  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    alert("🔐 Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    
  };
  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;
  
      try {
        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;
  
        if (decoded.exp < now) {
          handleLogout(); // 👉 tự logout nếu token hết hạn
        }
      } catch (err) {
        console.error("❌ Token không hợp lệ:", err);
        handleLogout(); // 👉 token lỗi => cũng logout
      }
    };
  
    checkToken(); // gọi ngay khi vào trang
  }, []);
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const { data, ok } = await login(email, password);
      console.log("Login response:", data);

      if (ok && data.access_token) {
        localStorage.setItem("access_token", data.access_token);

        const { data: userInfo, ok: whoamiOK } = await whoami(data.access_token);

        if (whoamiOK) {
          localStorage.setItem("user", JSON.stringify(userInfo));
          alert("✅ Đăng nhập thành công!");
          navigate("/profile");
        } else {
          alert("❌ Lỗi khi lấy thông tin người dùng");
        }
      } else {
        alert("❌ Sai tên đăng nhập hoặc mật khẩu");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi đăng nhập");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    console.log("Google user info:", decoded);

    try {
      const data = await googleLogin(credentialResponse.credential);

      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user", JSON.stringify({
          name: data.name,
          email: data.email,
          id: data.id,
          picture: data.picture,
        }));

        alert("✅ Đăng nhập bằng Google thành công!");
        navigate("/profile");
      } else {
        alert("❌ Lỗi xác thực Google từ server!");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Đăng nhập Google thất bại!");
    }
  };

  const handleGoogleError = () => {
    alert("❌ Đăng nhập Google thất bại!");
  };
    


  const fetchTransactions = async () => {
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      const now = Date.now() / 1000;

      if (decoded.exp < now) {
        console.warn("⚠️ Token đã hết hạn");
        return;
      }

      //console.log("📦 Token gửi đi:", token);

      const res = await getTransactions(token);
      setTransactions(res.data.data || []);
      setShowTransactions(true);
    } catch (err) {
      console.error("❌ Lỗi khi lấy lịch sử giao dịch:", err);
    }
  };

if (user) {
  // ✅ Nếu đã đăng nhập
  return (
    <div className="container mt-5">
      <h1>Xin chào, {user.name || user.email}</h1>
      {user.picture && (
        <img src={user.picture} alt="avatar" style={{ width: 100, borderRadius: "50%" }} />
      )}
      <p>Email: {user.email}</p>
      <button
        className="btn btn-danger mt-2"
        onClick={() => {
          localStorage.clear();
          navigate("/Profile");
        }}
      >
        Đăng xuất
      </button>
  
      {/* Nút gọi xem lịch sử giao dịch */}
      <div className="mt-4">
        <button className="btn btn-primary" onClick={fetchTransactions}>
          📜 Xem lịch sử giao dịch
        </button>
      </div>
  
      {/* Hiển thị bảng nếu có */}
      {showTransactions && (
        <div className="mt-4">
          <h3>Lịch sử giao dịch</h3>
          {transactions.length === 0 ? (
            <p>Không có giao dịch nào.</p>
          ) : (
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Request ID</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                  <th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>{tx.order_id}</td>
                    <td>{tx.request_id}</td>
                    <td>{tx.amount.toLocaleString()} đ</td>
                    <td>{tx.status}</td>
                    <td>{new Date(tx.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
  // ✅ Nếu chưa đăng nhập
  return (
    <div className="container">
      <h1>Profile</h1>
      <p>Bạn chưa đăng nhập.</p>
      <button className="btn btn-primary me-2" onClick={() => setShowForm("login")}>
        Đăng nhập
      </button>
      <button className="btn btn-secondary" onClick={() => setShowForm("register")}>
        Đăng ký
      </button>
      {showForm === "login" && (
  <div className="card mt-4 shadow-sm" style={{ maxWidth: 400, margin: "0 auto" }}>
    <div className="card-body">
      <h3 className="card-title mb-3 text-center">🔐 Đăng nhập</h3>
      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email hoặc Username
          </label>
          <input
            type="text"
            className="form-control"
            id="email"
            placeholder="Nhập email hoặc username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">Mật khẩu</label>
          <input
            type="password"
            className="form-control"
            id="password"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-check mb-3">
          <input type="checkbox" className="form-check-input" id="remember" />
          <label className="form-check-label" htmlFor="remember">Ghi nhớ tài khoản</label>
        </div>

        <button type="submit" className="btn btn-primary w-100">Đăng nhập</button>
      </form>

      

      <div className="Login">
        <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
      </div> 
      <div className="text-center mt-3">
        <Link to="/forgot-password">❓ Quên mật khẩu?</Link>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default Profile;
