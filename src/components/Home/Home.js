import React, { useEffect, useState, useRef } from "react";

const Home = () => {
  const [client, setClient] = useState(null);
  const [chat, setChat] = useState(null);
  const [targetId, setTargetId] = useState(""); // ID người muốn chat
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const conversationRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthError, setShowAuthError] = useState(false); // State để hiển thị lỗi xác thực

  const [stringeeToken, setStringeeToken] = useState(null);

  useEffect(() => {
    const fetchUserInfoAndStringeeToken = async () => {
      const jwtToken = localStorage.getItem("access_token");

      if (!jwtToken) {
        console.warn("⚠️ Không tìm thấy JWT Token trong localStorage.");
        setShowAuthError(true); // Hiển thị lỗi nếu không có token
        return;
      }

      try {
        // Fetch user info
        const userRes = await fetch("http://localhost:8000/api/whoami", {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });

        // --- Bắt đầu xử lý lỗi token hết hạn/không hợp lệ ---
        if (userRes.status === 401 || userRes.status === 403) {
          console.error("❌ JWT Token hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.");
          localStorage.removeItem("jwt"); // Xóa token cũ
          setShowAuthError(true); // Hiển thị thông báo lỗi xác thực
          setCurrentUser(null); // Xóa thông tin người dùng hiện tại
          setStringeeToken(null); // Đảm bảo Stringee token cũng bị xóa
          return; // Dừng thực thi hàm
        }
        // --- Kết thúc xử lý lỗi token hết hạn/không hợp lệ ---

        if (!userRes.ok) {
          console.error("❌ Lỗi khi gọi whoami:", userRes.status, userRes.statusText);
          return;
        }

        const userData = await userRes.json();
        setCurrentUser(userData);
        console.log("🧑 Thông tin user hiện tại:", userData);

        // --- Cập nhật: Fetch Stringee Token từ endpoint đúng và tên trường đúng ---
        const stringeeTokenRes = await fetch("http://localhost:8000/api/stringee/token", {
          method: 'POST', // Đã thêm phương thức POST
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            'Content-Type': 'application/json' // Thêm Content-Type nếu backend mong đợi body JSON (mặc dù ở đây không có body)
          },
        });

        // --- Bắt đầu xử lý lỗi token hết hạn/không hợp lệ cho Stringee token ---
        if (stringeeTokenRes.status === 401 || stringeeTokenRes.status === 403) {
          console.error("❌ JWT Token hết hạn hoặc không hợp lệ khi lấy Stringee token. Vui lòng đăng nhập lại.");
          localStorage.removeItem("jwt"); // Xóa token cũ
          setShowAuthError(true); // Hiển thị thông báo lỗi xác thực
          setCurrentUser(null); // Xóa thông tin người dùng hiện tại
          setStringeeToken(null); // Đảm bảo Stringee token cũng bị xóa
          return; // Dừng thực thi hàm
        }
        // --- Kết thúc xử lý lỗi token hết hạn/không hợp lệ cho Stringee token ---

        if (!stringeeTokenRes.ok) {
          console.error("❌ Lỗi khi lấy Stringee token:", stringeeTokenRes.status, stringeeTokenRes.statusText);
          return;
        }

        const stringeeTokenData = await stringeeTokenRes.json();
        setStringeeToken(stringeeTokenData.stringee_access_token); // Đã cập nhật tên trường
        console.log("🔑 Stringee Token:", stringeeTokenData.stringee_access_token);
        setShowAuthError(false); // Ẩn lỗi nếu mọi thứ thành công
        // ---------------------------------------------------------------------

      } catch (err) {
        console.error("❌ Lỗi khi gọi API:", err);
        // Có thể là lỗi mạng hoặc lỗi server khác, cũng nên thông báo cho người dùng
        // setShowAuthError(true); // Tùy chọn: hiển thị lỗi chung
      }
    };

    fetchUserInfoAndStringeeToken();
  }, []); // Run once on component mount

  // ✅ Khởi tạo StringeeClient và Chat
  useEffect(() => {
    // Kiểm tra xem Stringee SDK đã tải và token đã có chưa
    if (!window.StringeeClient || !window.StringeeChat || !stringeeToken) {
      console.warn("⚠️ SDK Stringee hoặc token chưa sẵn sàng để kết nối.");
      return;
    }

    const _client = new window.StringeeClient();
    const _chat = new window.StringeeChat(_client);

    // Lắng nghe sự kiện kết nối của StringeeClient
    _client.on("connect", () => console.log("✅ Stringee Client đã kết nối thành công."));
    _client.on("authen", (res) => console.log("🔐 Xác thực Stringee:", res));
    _client.on("disconnect", () => console.log("🔌 Stringee Client đã ngắt kết nối."));
    _client.on("requesttoken", () => {
      console.warn("⚠️ Stringee yêu cầu token mới. Cần làm mới token.");
      // Ở đây bạn có thể gọi lại hàm fetchUserInfoAndStringeeToken để lấy token mới
      // fetchUserInfoAndStringeeToken(); // Gọi lại để refresh token
    });


    // Lắng nghe sự kiện nhận tin nhắn từ StringeeChat
    _chat.on("message", (msg) => {
      console.log("💬 Nhận tin nhắn mới:", msg);
      setMessages((prev) => [...prev, msg]); // Thêm tin nhắn mới vào danh sách
    });

    // Kết nối StringeeClient với token đã lấy từ backend
    _client.connect(stringeeToken);

    // Lưu trữ client và chat instance vào state
    setClient(_client);
    setChat(_chat);

    // Hàm dọn dẹp khi component unmount
    return () => {
      if (_client) {
        _client.disconnect(); // Ngắt kết nối StringeeClient
      }
    };
  }, [stringeeToken]); // useEffect này sẽ chạy lại khi stringeeToken thay đổi

  // Hàm tạo hoặc lấy cuộc trò chuyện
  const createOrGetConversation = () => {
    // Thêm log để kiểm tra giá trị của chat và targetId
    console.log("Debug: createOrGetConversation called.");
    console.log("Debug: chat object:", chat);
    console.log("Debug: targetId value:", targetId);

    if (!chat || !targetId) {
        console.warn("⚠️ Chat client chưa sẵn sàng hoặc ID người muốn chat trống.");
        return;
    }

    // Gọi API của Stringee để lấy hoặc tạo cuộc trò chuyện giữa người dùng hiện tại và targetId
    chat.getConversationBetween([targetId], true, (status, code, message, conv) => {
      if (status) {
        conversationRef.current = conv; // Lưu trữ đối tượng cuộc trò chuyện
        console.log("✅ Cuộc trò chuyện đã được tạo/truy xuất:", conv);

        // Lấy 20 tin nhắn gần nhất của cuộc trò chuyện
        conv.getLastMessages(20, true, (status, code, message, msgs) => {
          if (status) {
            setMessages(msgs.reverse()); // Đảo ngược để hiển thị tin nhắn mới nhất ở dưới cùng
            console.log("📜 Tin nhắn gần đây:", msgs);
          } else {
            console.error("❌ Lỗi khi lấy tin nhắn gần đây:", message);
            // Thay thế alert bằng một modal hoặc thông báo UI thân thiện hơn
            // alert(`❌ Lỗi khi lấy tin nhắn: ${message}`);
          }
        });
      } else {
        console.error("❌ Không thể tạo/truy xuất cuộc trò chuyện:", message);
        // Thay thế alert bằng một modal hoặc thông báo UI thân thiện hơn
        // alert(`❌ Không thể tạo cuộc trò chuyện: ${message}`);
      }
    });
  };

  // Hàm gửi tin nhắn
  const sendMessage = () => {
    if (!message.trim() || !conversationRef.current) {
        console.warn("⚠️ Tin nhắn trống hoặc chưa có cuộc trò chuyện được chọn.");
        return;
    }

    // Chuẩn bị dữ liệu tin nhắn
    const msgData = {
      type: 1, // Loại tin nhắn: 1 = text
      convId: conversationRef.current.id, // ID cuộc trò chuyện
      message: { content: message }, // Nội dung tin nhắn
    };

    // Gửi tin nhắn qua StringeeChat
    chat.sendMessage(msgData, (status, code, message, msg) => {
      if (status) {
        setMessages((prev) => [...prev, msg]); // Thêm tin nhắn đã gửi vào danh sách
        setMessage(""); // Xóa nội dung input tin nhắn
        console.log("✅ Tin nhắn đã gửi thành công:", msg);
      } else {
        console.error("❌ Lỗi khi gửi tin nhắn:", message);
        // Thay thế alert bằng một modal hoặc thông báo UI thân thiện hơn
        // alert(`❌ Lỗi khi gửi tin nhắn: ${message}`);
      }
    });
  };

  return (
    <div className="p-5 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h3 className="text-2xl font-bold text-center text-gray-800">💬 Stringee Chat</h3>

      {showAuthError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Lỗi xác thực!</strong>
          <span className="block sm:inline"> Phiên của bạn đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.</span>
        </div>
      )}

      {currentUser && (
        <div className="bg-blue-100 p-3 rounded-lg text-blue-800">
          <p className="text-sm">
            🆔 UUID của bạn: <code className="font-mono text-blue-900">{currentUser.id}</code>
          </p>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <input
          className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nhập userId cần chat"
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
        />
        <button
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={createOrGetConversation}
        >
          🔗 Kết nối
        </button>
      </div>

      <div
        className="mt-4 border border-gray-300 rounded-lg h-64 overflow-y-auto p-3 bg-gray-50"
      >
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center italic">Chưa có tin nhắn nào. Hãy kết nối và bắt đầu chat!</p>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`mb-1 ${msg.sender === currentUser?.id ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block px-3 py-1 rounded-lg ${msg.sender === currentUser?.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                <b>{msg.sender === currentUser?.id ? "Bạn" : msg.sender}</b>: {msg.message.content}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center space-x-2 mt-4">
        <input
          className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Nhập tin nhắn..."
        />
        <button
          className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          onClick={sendMessage}
        >
          📨 Gửi
        </button>
      </div>
    </div>
  );
};

export default Home;
