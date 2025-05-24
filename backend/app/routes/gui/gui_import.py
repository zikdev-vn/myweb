import tkinter as tk
from tkinter import messagebox
from sqlalchemy.orm import sessionmaker
from app.database import SessionLocal  # hoặc import SessionLocal nếu bạn đã định nghĩa sẵn
from app.models import Product
from datetime import datetime
from tkinter import filedialog
import os
import shutil
import uuid


session = SessionLocal()
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMAGES_DIR = os.path.join(BASE_DIR, "images")
def submit_form():
    try:
        if not name_var.get() or not price_var.get() or not category_var.get():
            messagebox.showwarning("Thiếu thông tin", "Vui lòng nhập đủ Tên, Giá và Danh mục.")
            return

        try:
            price = float(price_var.get())
            discount = float(discount_var.get())
            stock = int(stock_var.get())
        except ValueError:
            messagebox.showerror("Lỗi", "Giá, Giảm giá và Tồn kho phải là số hợp lệ!")
            return

        product = Product(
            name=name_var.get(),
            description=description_var.get(),
            price=price,
            discount=discount,
            stock=stock,
            category=category_var.get(),
            image1=image1_var.get(),
            image2=image2_var.get(),
            is_featured=is_featured_var.get(),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        session.add(product)
        session.commit()
        messagebox.showinfo("Thành công", "Đã thêm sản phẩm!")
    except Exception as e:
        session.rollback()
        messagebox.showerror("Lỗi", f"Không thể thêm sản phẩm:\n{e}")

def select_image(var):
    file_path = filedialog.askopenfilename(
        title="Chọn ảnh",
        filetypes=[("All files", "*.*")]
    )
    if file_path:
        ext = os.path.splitext(file_path)[1]
        filename = f"{uuid.uuid4().hex}{ext}"
        dest_path = os.path.join(IMAGES_DIR, filename)
        shutil.copy(file_path, dest_path)
        var.set(filename)  # ✅ chỉ set tên file, KHÔNG có đường dẫn
        print(f"[UPLOAD] Saved to: {dest_path}")
        messagebox.showinfo("Thành công", f"Đã tải lên ảnh: {filename}")
# Tạo cửa sổ chính
root = tk.Tk()
root.title("Thêm Sản Phẩm")

# Khai báo biến
name_var = tk.StringVar()
description_var = tk.StringVar()
price_var = tk.StringVar()
discount_var = tk.StringVar(value="0.0")
stock_var = tk.StringVar(value="0")
category_var = tk.StringVar()
image1_var = tk.StringVar()
image2_var = tk.StringVar()
is_featured_var = tk.BooleanVar()

# Giao diện nhập liệu
fields = [
    ("Tên sản phẩm", name_var),
    ("Mô tả", description_var),
    ("Giá", price_var),
    ("Giảm giá", discount_var),
    ("Tồn kho", stock_var),
    ("Danh mục", category_var),
    ("Ảnh 1 (URL)", image1_var),
    ("Ảnh 2 (URL)", image2_var),
]

for idx, (label_text, var) in enumerate(fields):
    tk.Label(root, text=label_text).grid(row=idx, column=0, sticky="e", padx=5, pady=2)
    tk.Entry(root, textvariable=var, width=40).grid(row=idx, column=1, padx=5, pady=2)

tk.Checkbutton(root, text="Nổi bật", variable=is_featured_var).grid(row=len(fields), column=1, sticky="w")

# Nút submit
tk.Button(root, text="Thêm sản phẩm", command=submit_form, bg="green", fg="white").grid(
    row=len(fields)+1, columnspan=2, pady=10
)
tk.Label(root, text="Ảnh 1").grid(row=7, column=0, sticky="e", padx=5, pady=2)
tk.Entry(root, textvariable=image1_var, width=30).grid(row=7, column=1, sticky="w")
tk.Button(root, text="Chọn ảnh", command=lambda: select_image(image1_var)).grid(row=7, column=2)

# Image 2
tk.Label(root, text="Ảnh 2").grid(row=8, column=0, sticky="e", padx=5, pady=2)
tk.Entry(root, textvariable=image2_var, width=30).grid(row=8, column=1, sticky="w")
tk.Button(root, text="Chọn ảnh", command=lambda: select_image(image2_var)).grid(row=8, column=2)
root.mainloop()
