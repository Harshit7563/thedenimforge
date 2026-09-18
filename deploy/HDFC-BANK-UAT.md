# HDFC SmartGateway — Bank UAT Testing Pack

Merchant: **CODEQUIP WEBTECH PRIVATE LIMITED**  
Account (WEB): **SG6133**  
Brand site: **https://thedenimforge.com**

---

## Mandatory details (fill & send to bank)

| Field | Value |
|--------|--------|
| MERCHANT NAME | CODEQUIP WEBTECH PRIVATE LIMITED |
| Account Id (WEB) | SG6133 |
| WEBSITE URL | https://thedenimforge.com |
| Website publicly accessible | **Yes** |
| LOGIN ID (buyer test) | *(create a test buyer on /register, share with bank)* |
| LOGIN PWD | *(share securely with bank only)* |
| RESPONSE URL | https://thedenimforge.com/api/payments/return |
| Webhook URL (optional) | https://thedenimforge.com/api/payments/webhook |
| DEVELOPER CONTACT NO | 8424939262 |
| DEVELOPER EMAIL ID | codequipwebtech@gmail.com |
| TYPE | VAS |
| Programming Language | Node.js (Express) + React |
| Plugin Name and version | None (custom TranPortal / UPI Intent) |
| Transaction Flow verified | Yes (after UAT success) |
| Multiple Amount Values | Yes — cart total + shipping |
| Transactions stored in DB (incl. Failed) | **Yes** (`orders.payment_status`, `payment_gateway_status`, `payment_meta`) |

---

## A. Payment flow URLs (screenshot these in order)

1. Home — `https://thedenimforge.com/`
2. Category / product — e.g. `https://thedenimforge.com/category/mens-jeans`
3. Product PDP — `https://thedenimforge.com/product/<slug>`
4. Cart — `https://thedenimforge.com/cart`
5. Login (if needed) — `https://thedenimforge.com/login`
6. Checkout — `https://thedenimforge.com/checkout` → select **UPI by HDFC**
7. UPI payment — `https://thedenimforge.com/payment-processing` (QR / Open UPI app)
8. Return (bank redirect) — `https://thedenimforge.com/payment/return?order_id=<ORDER_ID>`
9. **Success response page** — `https://thedenimforge.com/order-success`  
   Shows: **Order Number**, **Amount**, **Payment Successful**

---

## B. Success page (bank requirement)

Response page displays in real-time:

- Order Number (same as HDFC `order_id`)
- Amount (INR)
- Success message: **Payment Successful / Success — Transaction completed**

---

## C. Order Status API logs

Server polls:

`GET https://smartgateway.hdfcuat.bank.in/orders/{order_id}`

With headers: `Authorization: Basic …`, `x-merchantid: SG6133`, `x-routing-id: <customer_id>`, `version: YYYY-MM-DD`

After a test payment, export logs:

```bash
pm2 logs thedenimforge-api --lines 200 | grep 'HDFC'
# or Admin → Orders → Check HDFC status (returns raw JSON)
```

Also stored on order row: `payment_meta.last_status_response`

---

## D. Technical compliance checklist

| Check | Status |
|--------|--------|
| Unique `customer_id` per customer | Yes (`payment_customer_id` = `u` + user uuid hex) |
| Do **not** use UDF2 | Yes — only `udf1` = order id |
| Order id & amount on response page match gateway | Yes |
| Order id format &lt;21, alphanumeric, non-sequential | Yes (`DFxxxxxxxxxxxxxx`, 16 chars, crypto-random) |
| Failed txns stored in DB | Yes (`payment_status=failed`) |
| HTTPS site | Yes |

---

## After successful UAT payment

1. Take screenshots A (1→9) with address bar visible  
2. Screenshot success page showing Order Number + Amount + Success  
3. Copy one **CHARGED** status API JSON (Admin “Check HDFC status” or PM2 log)  
4. Email pack to HDFC bank testing team  

**Note:** Security audit is mandatory before production go-live (`HDFC_BASE_URL` → `https://smartgateway.hdfc.bank.in`).
