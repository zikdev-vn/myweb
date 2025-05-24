import React, { useEffect, useState } from "react";
import axios from "axios";
import './Shop.css'; // Đường dẫn đến file CSS của bạn
const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [rawData, setRawData] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://192.168.1.65:8000/api/products");
        const data = res.data;
        console.log("Sản phẩm từ API:", data);
        setProducts(data);
        setRawData(data); // để hiển thị JSON nếu cần
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      }
    };

    fetchProducts();
  }, []);
  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
  
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
  
    localStorage.setItem("cart", JSON.stringify(cart));
  
    // 👉 Thêm dòng này để thông báo cho Navbar cập nhật
    window.dispatchEvent(new Event("cartUpdated"));
  
    alert(`Đã thêm ${product.name} vào giỏ hàng`);
  };
  
  const handleBuyNow = (product) => {
    // 👇 Chuyển hướng đến trang thanh toán với sản phẩm này (hoặc thêm vào cart trước)
    handleAddToCart(product);
    window.location.href = "/Cart";
  };
  
  return (
    <div className="container-main">
      <h1 className="text-2xl font-bold mb-4">Tất cả sản phẩm</h1>

      {/* ✅ Hiển thị danh sách sản phẩm */}
      <div className="container-items">
        <div className="container-box-item">
        {products.length > 0 && (
          <div className="border p-4 rounded shadow bg-white">
            <img
              src={`http://localhost:8000${products[0].image2}`}
              alt={products[0].name}
              className="w-full h-40 object-cover mb-2"
            />
            <h3 className="text-lg font-semibold">{products[0].name}</h3>
            <p className="text-sm text-gray-600">{products[0].description}</p>
            <p className="text-red-500 font-bold mt-1">
              {Number(products[0].price).toLocaleString()} đ
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => handleAddToCart(products[0])}
                className="button-add-to-cart"
              >
                Thêm vào giỏ
              </button>
              <button
                onClick={() => handleBuyNow(products[0])}
                className="button-buy"
              >
                Mua ngay
              </button>
            </div>
          </div>
        )}
        </div>
      
      
        <div className="container-box-item">
        {products.length > 1 && (
          <div className="border p-4 rounded shadow bg-white">
            <img
              src={`http://localhost:8000${products[1].image2}`}
              alt={products[1].name}
              className="w-full h-40 object-cover mb-2"
            />
            <h3 className="text-lg font-semibold">{products[1].name}</h3>
            <p className="text-sm text-gray-600">{products[1].description}</p>
            <p className="text-red-500 font-bold mt-1">
              {Number(products[1].price).toLocaleString()} đ
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => handleAddToCart(products[1])}
                className="button-add-to-cart"
              >
                Thêm vào giỏ
              </button>
              <button
                onClick={() => handleBuyNow(products[1])}
                className="button-buy"
              >
                Mua ngay
              </button>
            </div>
          </div>
        )}
        </div>
        
        <div className="container-box-item">
        {products.length > 2 && (
          <div className="border p-4 rounded shadow bg-white">
            <img
              src={`http://localhost:8000${products[2].image2}`}
              alt={products[2].name}
              className="w-full h-40 object-cover mb-2"
            />
            <h3 className="text-lg font-semibold">{products[2].name}</h3>
            <p className="text-sm text-gray-600">{products[2].description}</p>
            <p className="text-red-500 font-bold mt-1">
              {Number(products[2].price).toLocaleString()} đ
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => handleAddToCart(products[2])}
                className="button-add-to-cart"
              >
                Thêm vào giỏ
              </button>
              <button
                onClick={() => handleBuyNow(products[2])}
                className="button-buy"
              >
                Mua ngay
              </button>
            </div>
          </div>
        )}
        </div>


        <div className="container-box-item">
        {products.length > 3 && (
          <div className="border p-4 rounded shadow bg-white">
            <img
              src={`http://localhost:8000${products[3].image2}`}
              alt={products[3].name}
              className="w-full h-40 object-cover mb-2"
            />
            <h3 className="text-lg font-semibold">{products[3].name}</h3>
            <p className="text-sm text-gray-600">{products[3].description}</p>
            <p className="text-red-500 font-bold mt-1">
              {Number(products[3].price).toLocaleString()} đ
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => handleAddToCart(products[3])}
                className="button-add-to-cart"
              >
                Thêm vào giỏ
              </button>
              <button
                onClick={() => handleBuyNow(products[3])}
                className="button-buy"
              >
                Mua ngay
              </button>
            </div>
          </div>
        )}
        </div>

        
      </div>


    </div>
  );
}  

export default ProductList;
