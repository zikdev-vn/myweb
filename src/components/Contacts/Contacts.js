/*import React from "react";

const Contacts = () => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const message = e.target.message.value;

    const text = `📩 *Contact Form*\n👤 *Name*: ${name}\n📧 *Email*: ${email}\n📝 *Message*: ${message}`;
    const token = "7318734370:AAGCyDSFwsb4Ln3DHn9y9FnzDfPWiq_1YxA";
    const chatId = "7447164672";

    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: "Markdown",
        }),
      });

      if (res.ok) {
        alert("✅ Gửi thành công!");
        e.target.reset();
      } else {
        alert("❌ Gửi thất bại.");
      }
    } catch (err) {
      console.error("Lỗi gửi:", err);
      alert("❌ Có lỗi khi gửi.");
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Contact Us</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name</label>
          <input type="text" className="form-control w-full p-2 border" id="name" name="name" required />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input type="email" className="form-control w-full p-2 border" id="email" name="email" required />
        </div>
        <div className="mb-3">
          <label htmlFor="message" className="form-label">Message</label>
          <textarea className="form-control w-full p-2 border" id="message" name="message" rows="3" required></textarea>
        </div>
        <button type="submit" className="btn btn-primary bg-blue-600 text-white px-4 py-2 rounded">
          Submit
        </button>
      </form>
    </div>
  );
};

export default Contacts;*/





import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import Turnstile from "react-turnstile";
import "./Contacts.css";
import { useEffect } from "react";
import { verify_turnstile } from "../../api/security/verify";


const Contacts = () => {


  const form = useRef();
  const [token, setToken] = useState("");
  const captchaRef = useRef();

  const sendEmail = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("❌ Vui lòng xác minh bạn không phải bot!");
      return;
    }

    try {
      const data = await verify_turnstile(token);

      if (!data.success) {
        alert("❌ Xác minh CAPTCHA thất bại!");
        return;
      }

      await emailjs.sendForm(
        "Zikdev",
        "template_qe8spqv",
        form.current,
        "xodn6s_pSIGeO-GHy"
      );

      alert("✅ Gửi thành công!");
      form.current.reset();
      setToken("");
      if (captchaRef.current) {
        window.turnstile?.reset(captchaRef.current);
      }

    } catch (err) {
      console.error(err);
      alert("❌ Lỗi xác minh CAPTCHA!");
    }
  };
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isInput = ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName);
      if (e.key === "Enter" && !isInput && token) {
        e.preventDefault();
        form.current?.requestSubmit(); // Gửi form nếu token đã có
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [token]);
  return (
    <div className="contact-page">
      <div className="main-content">
        <div className="container">
          <h1>Contact Us</h1>
          <form className="form-contact" ref={form} onSubmit={sendEmail}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Name</label>
              <input type="text" name="user_name" className="form-control" id="name" required />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input type="email" name="user_email" className="form-control" id="email" required />
            </div>
            <div className="mb-3">
              <label htmlFor="message" className="form-label">Message</label>
              <textarea name="message" className="form-control" id="message" rows="3" required></textarea>
            </div>

            {/* ✅ Turnstile CAPTCHA */}
            <div className="mb-3">
              <Turnstile
                sitekey="0x4AAAAAABdwuUQd1_GY9f5X"
                onSuccess={(token) => setToken(token)}
                onExpire={() => setToken("")}
                ref={captchaRef}
              />
            </div>

            <button type="submit" className="btn-submit">Submit</button>
          </form>
        </div>
        <div className="map-container">
          <p>Contact us at:</p>
          <p>Bạn cần liên hệ với chúng tôi? Hãy gửi tin nhắn hoặc báo lỗi ở đây nhé.</p>
        </div>
      </div>
      <footer className="footer" />
    </div>
  );
};

export default Contacts;
