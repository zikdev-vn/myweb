# Dang dung FlaskAPI
from fastapi import APIRouter, HTTPException
from fastapi import FastAPI, Request, HTTPException
from pydantic import BaseModel
import uuid, hmac, hashlib, requests
from typing import Dict



router = APIRouter()

# MoMo Payment Config
MOMO_ENDPOINT = "https://test-payment.momo.vn/v2/gateway/api/create"
ACCESS_KEY = "F8BBA842ECF85"
SECRET_KEY = "K951B6PE1waDMi640xX08PD3vg6EkVlz"
PARTNER_CODE = "MOMO"
REDIRECT_URL = "https://allowing-terrapin-eminently.ngrok-free.app/api/call-back"
IPN_URL = "https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b"

MOMO_QUERY_ENDPOINT = "https://test-payment.momo.vn/v2/gateway/api/query"

transaction_data={}

# Class nhận callback từ MoMo
class MoMoCallback(BaseModel):
    resultCode: int
    message: str
    orderId: str
    amount: int
    requestId: str  # Thêm requestId vào callback để lưu lại

# Nhận callback từ MoMo và lưu lại thông tin
@router.post("/call-back")
async def call_back(data: MoMoCallback):
    if data.resultCode == 0:
        # Lưu dữ liệu vào biến toàn cục (nên thay bằng database thực tế)
        transaction_data[data.orderId] = {
            "orderId": data.orderId,
            "requestId": data.requestId,
            "amount": data.amount,
            "message": data.message
        }
        print("🔥 Nhận callback từ MoMo:", data)
        return {
            "status": "success",
            "message": data.message,
            "orderId": data.orderId,
            "amount": data.amount
        }
    else:
        raise HTTPException(status_code=400, detail=data.message)
# Class yêu cầu trạng thái giao dịch
class QueryRequest(BaseModel):
    orderId: str
    requestId: str

# API kiểm tra trạng thái giao dịch
from fastapi import Depends
from sqlalchemy.orm import Session
from app.models import TransactionHistory, User  # đảm bảo bạn có model này
from app.database import get_db
from app.routes.Login.login import get_optional_user  # hàm decode access_token

@router.post("/transaction-status")
def transaction_status(
    query: QueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_user)
):
    print(f"🔍 Nhận yêu cầu kiểm tra trạng thái từ client:")
    print(f"orderId: {query.orderId}, requestId: {query.requestId}")

    if query.orderId not in transaction_data:
        raise HTTPException(status_code=400, detail="OrderId không hợp lệ")

    saved_data = transaction_data[query.orderId]
    request_id = query.requestId if query.requestId else saved_data["requestId"]

    # Tạo raw signature
    raw_signature = (
        f"accessKey={ACCESS_KEY}&orderId={query.orderId}&partnerCode={PARTNER_CODE}&requestId={request_id}"
    )
    print(f"🔍 Tạo chữ ký với raw_signature: {raw_signature}")

    signature = hmac.new(
        SECRET_KEY.encode("utf-8"),
        raw_signature.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()

    payload = {
        "partnerCode": PARTNER_CODE,
        "orderId": query.orderId,
        "requestId": request_id,
        "lang": "vi",
        "signature": signature
    }

    print(f"🔍 Payload gửi đến MoMo: {payload}")

    try:
        response = requests.post(MOMO_QUERY_ENDPOINT, json=payload)

        if response.status_code == 200:
            result = response.json()
            print("📡 Kết quả truy vấn trạng thái từ MoMo:")
            print(result)

            # Nếu có người dùng đang đăng nhập và giao dịch thành công
            if current_user and result.get("resultCode") == 0:
                transaction = TransactionHistory(
                    user_id=current_user.id,
                    order_id=query.orderId,
                    request_id=request_id,
                    amount=result.get("amount"),
                    status=result.get("message"),
                    
                )
                db.add(transaction)
                db.commit()
                print("✅ Đã lưu transaction thành công:", transaction)
            return result
        else:
            print(f"❌ Lỗi khi gọi MoMo API. Mã trạng thái: {response.status_code}")
            raise HTTPException(status_code=500, detail="Không thể truy vấn trạng thái giao dịch")

    except Exception as e:
        print(f"❌ Lỗi khi xử lý yêu cầu: {e}")
        raise HTTPException(status_code=500, detail="Không thể truy vấn trạng thái giao dịch")



class PaymentRequest(BaseModel):
    amount: int  # nhận từ frontend

@router.post("/create-payment")
def create_payment(req: PaymentRequest):
    # MoMo Config (dùng tạm, nên chuyển qua biến môi trường)
    endpoint = "https://test-payment.momo.vn/v2/gateway/api/create"
    partnerCode = "MOMO"
    accessKey = "F8BBA842ECF85"
    secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz"
    orderInfo = "Thanh toán đơn hàng"
    redirectUrl = "http://localhost:3000/Cart"
    ipnUrl = "https://allowing-terrapin-eminently.ngrok-free.app/api/call-back"
    amount = str(req.amount)
    orderId = str(uuid.uuid4())
    requestId = str(uuid.uuid4())
    requestType = "captureWallet"
    extraData = ""

    # Raw signature
    raw_signature = (
        f"accessKey={accessKey}&amount={amount}&extraData={extraData}&ipnUrl={ipnUrl}"
        f"&orderId={orderId}&orderInfo={orderInfo}&partnerCode={partnerCode}"
        f"&redirectUrl={redirectUrl}&requestId={requestId}&requestType={requestType}"
    )

    # Ký HMAC SHA256
    signature = hmac.new(
        secretKey.encode("utf-8"),
        raw_signature.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()

    # Payload gửi tới MoMo
    data = {
        "partnerCode": partnerCode,
        "partnerName": "Test",
        "storeId": "MomoTestStore",
        "requestId": requestId,
        "amount": amount,
        "orderId": orderId,
        "orderInfo": orderInfo,
        "redirectUrl": redirectUrl,
        "ipnUrl": ipnUrl,
        "lang": "vi",
        "extraData": extraData,
        "requestType": requestType,
        "signature": signature
    }

    try:
        response = requests.post(endpoint, json=data, headers={'Content-Type': 'application/json'})
        result = response.json()

        if "payUrl" in result:
            print("🎯 Kết quả từ MoMo:", result)
            return {
                "orderId": orderId,
                "requestId": requestId,
                "payUrl": result["payUrl"],
                "resultCode": result["resultCode"],
                "message": result["message"]
            }
        else:
            raise HTTPException(status_code=400, detail="Không lấy được payUrl từ MoMo.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi hệ thống: {str(e)}")