import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import './Navbar.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  const [count, setCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const totalQty = cart.reduce((acc, item) => acc + item.quantity, 0);
      setCount(totalQty);
    };
  
    // Gọi khi mount
    updateCount();
  
    // Gọi lại mỗi khi localStorage thay đổi (ở tab khác hoặc cùng tab qua dispatchEvent)
    window.addEventListener("storage", updateCount);
  
    // Gọi lại khi có custom event (ta sẽ dùng sau khi thêm/xóa)
    window.addEventListener("cartUpdated", updateCount);
  
    return () => {
      window.removeEventListener("storage", updateCount);
      window.removeEventListener("cartUpdated", updateCount);
    };
  }, []);
  return (
    <header>
      <div className="logo">ZIKDEV</div>

      <div className="hamburger" onClick={toggleMenu}>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
      </div>

      <nav className={`nav-bar ${isOpen ? 'active' : ''}`}>
        <ul>
        <li><Link to="/" onClick={() => setIsOpen(false)}>Home</Link></li>
          <li><Link to="/Shop" onClick={() => setIsOpen(false)}>Shop</Link></li>
          <li><Link to="/Contacts" onClick={() => setIsOpen(false)}>Contacts</Link></li>
          <li><Link to="/Profile" onClick={() => setIsOpen(false)}>Profile</Link></li>
          <li className="relative">
            <Link to="/Cart" className="flex items-center gap-1" onClick={() => setIsOpen(false)}>
              <FontAwesomeIcon icon={faShoppingCart} /> Cart
              {count > 0 && (
                <span className="absolute -top-2 -right-3 w-5 h-5 bg-red-500 text-[10px] rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
          </li>
          
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
