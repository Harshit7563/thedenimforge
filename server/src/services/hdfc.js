import crypto from 'crypto';

const CFG = {
  get apiKey() {
    return process.env.HDFC_API_KEY || '';
  },
  get merchantId() {
    return process.env.HDFC_MERCHANT_ID || '';
  },
  get baseUrl() {
    return (process.env.HDFC_BASE_URL || 'https://smartgateway.hdfcuat.bank.in').replace(/\/$/, '');
  },
  get paymentPageClientId() {
    return process.env.HDFC_PAYMENT_PAGE_CLIENT_ID || 'hdfcmaster';
  },
  get responseKey() {
    return process.env.HDFC_RESPONSE_KEY || '';
  },
  get resellerId() {
    return process.env.HDFC_RESELLER_ID || 'hdfc_reseller';
  },
  get logging() {
    return String(process.env.HDFC_ENABLE_LOGGING || '').toLowerCase() === 'true';
  },
};

export function hdfcConfigured() {
  return Boolean(CFG.apiKey && CFG.merchantId && CFG.baseUrl);
}

function basicAuthHeader() {
  // HTTP Basic: API_KEY as username, empty password → base64("API_KEY:")
  return `Basic ${Buffer.from(`${CFG.apiKey}:`, 'utf8').toString('base64')}`;
}

function log(...args) {
  if (CFG.logging) console.log('[HDFC]', ...args);
}

async function hdfcFormRequest(path, body, { routingId } = {}) {
  const url = `${CFG.baseUrl}${path}`;
  const headers = {
    Authorization: basicAuthHeader(),
    'Content-Type': 'application/x-www-form-urlencoded',
    'x-merchantid': CFG.merchantId,
    'x-resellerid': CFG.resellerId,
    version: new Date().toISOString().slice(0, 10),
  };
  if (routingId) {
    headers['x-routing-id'] = String(routingId);
    headers['x-customerid'] = String(routingId);
  }

  const payload = new URLSearchParams();
  for (const [k, v] of Object.entries(body)) {
    if (v === undefined || v === null || v === '') continue;
    payload.append(k, String(v));
  }

  log('POST', path, Object.fromEntries(payload));
  const res = await fetch(url, { method: 'POST', headers, body: payload.toString() });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    const msg = data?.error_message || data?.error_code || data?.message || text.slice(0, 300) || `HDFC HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.payload = data;
    throw err;
  }
  return data;
}

async function hdfcGet(path, { routingId } = {}) {
  const url = `${CFG.baseUrl}${path}`;
  const headers = {
    Authorization: basicAuthHeader(),
    'Content-Type': 'application/x-www-form-urlencoded',
    Accept: 'application/json',
    'x-merchantid': CFG.merchantId,
    'x-resellerid': CFG.resellerId,
    version: new Date().toISOString().slice(0, 10),
  };
  if (routingId) {
    headers['x-routing-id'] = String(routingId);
    headers['x-customerid'] = String(routingId);
  }

  log('GET', path, { routingId });
  const res = await fetch(url, { method: 'GET', headers });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  // Always keep a compact success/fail log line for bank UAT verification
  console.log('[HDFC][order-status]', JSON.stringify({
    path,
    http: res.status,
    order_id: data?.order_id,
    status: data?.status,
    status_id: data?.status_id,
    amount: data?.amount,
    txn_id: data?.txn_detail?.txn_id || data?.txn_id,
  }));
  if (CFG.logging) {
    console.log('[HDFC][order-status][full]', text.slice(0, 4000));
  }
  if (!res.ok) {
    const msg = data?.error_message || data?.error_code || data?.message || text.slice(0, 300) || `HDFC HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.payload = data;
    throw err;
  }
  return data;
}

function splitName(fullName = '') {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
  const first = (parts[0] || 'Customer').replace(/[^a-zA-Z0-9().\-_]/g, '').slice(0, 50) || 'Customer';
  const last = (parts.slice(1).join(' ') || 'Buyer').replace(/[^a-zA-Z0-9().\-_]/g, '').slice(0, 50) || 'Buyer';
  return { first, last };
}

function digitsPhone(phone = '') {
  const d = String(phone).replace(/\D/g, '');
  if (d.length >= 10) return d.slice(-10);
  return d;
}

/**
 * Create HDFC order then start UPI Intent (UPI_PAY) transaction.
 * Docs: /orders + /txns (payment_method=UPI_PAY, sdk_params=true)
 */
export async function createUpiIntentPayment({
  orderId,
  amount,
  customerId,
  customerEmail,
  customerPhone,
  customerName,
  returnUrl,
  description,
  address = {},
}) {
  if (!hdfcConfigured()) {
    throw new Error('HDFC payment gateway is not configured');
  }

  const { first, last } = splitName(customerName);
  const phone = digitsPhone(customerPhone);
  const amountStr = Number(amount).toFixed(2);
  const routingId = String(customerId || `guest${Date.now()}`).replace(/[^a-zA-Z0-9]/g, '').slice(0, 40);

  // HDFC order_id: alphanumeric only, no special chars, < 21
  const safeOrderId = String(orderId).replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
  if (!safeOrderId || safeOrderId.length > 20) {
    throw new Error('Invalid order id for payment gateway');
  }

  await hdfcFormRequest(
    '/orders',
    {
      order_id: safeOrderId,
      amount: amountStr,
      currency: 'INR',
      customer_id: routingId,
      customer_email: customerEmail,
      customer_phone: phone,
      return_url: returnUrl,
      description: (description || 'The Denim Forge order').slice(0, 255),
      billing_address_first_name: first,
      billing_address_last_name: last,
      billing_address_line1: (address.address_line1 || 'NA').slice(0, 100),
      billing_address_line2: (address.address_line2 || '').slice(0, 100),
      billing_address_city: (address.city || 'NA').slice(0, 50),
      billing_address_state: (address.state || 'NA').slice(0, 50),
      billing_address_country: 'India',
      billing_address_postal_code: String(address.pincode || '').slice(0, 10),
      billing_address_phone: phone,
      billing_address_country_code_iso: 'IND',
      shipping_address_first_name: first,
      shipping_address_last_name: last,
      shipping_address_line1: (address.address_line1 || 'NA').slice(0, 100),
      shipping_address_line2: (address.address_line2 || '').slice(0, 100),
      shipping_address_city: (address.city || 'NA').slice(0, 50),
      shipping_address_state: (address.state || 'NA').slice(0, 50),
      shipping_address_country: 'India',
      shipping_address_postal_code: String(address.pincode || '').slice(0, 10),
      shipping_address_phone: phone,
      shipping_address_country_code_iso: 'IND',
      udf1: safeOrderId,
    },
    { routingId }
  );

  const txn = await hdfcFormRequest(
    '/txns',
    {
      order_id: safeOrderId,
      merchant_id: CFG.merchantId,
      payment_method_type: 'UPI',
      payment_method: 'UPI_PAY',
      txn_type: 'UPI_PAY',
      sdk_params: 'true',
      redirect_after_payment: 'true',
      format: 'json',
    },
    { routingId }
  );

  const sdk = txn?.payment?.sdk_params || {};
  let intentUrl = sdk.pgIntentUrl || '';
  if (!intentUrl && sdk.tr && sdk.merchant_vpa) {
    const params = new URLSearchParams({
      ver: sdk.ver || '01',
      mode: sdk.mode || '04',
      tr: sdk.tr,
      tid: sdk.tid || '',
      tn: sdk.tn || description || '',
      pn: sdk.merchant_name || 'The Denim Forge',
      pa: sdk.merchant_vpa,
      mc: sdk.mcc || '5651',
      am: sdk.amount || amountStr,
      cu: sdk.currency || 'INR',
    });
    if (sdk.qrMedium) params.set('qrMedium', sdk.qrMedium);
    intentUrl = `upi://pay?${params.toString()}`;
  }

  if (!intentUrl) {
    throw new Error('HDFC did not return a UPI intent URL');
  }

  return {
    hdfc_order_id: txn.order_id || safeOrderId,
    txn_id: txn.txn_id || null,
    txn_uuid: txn.txn_uuid || null,
    status: txn.status || 'PENDING_VBV',
    intent_url: intentUrl,
    authentication_url: txn?.payment?.authentication?.url || null,
    sdk_params: sdk,
    amount: amountStr,
    customer_id: routingId,
    raw_txn: CFG.logging ? txn : undefined,
  };
}

export async function getHdfcOrderStatus(orderId, customerId) {
  if (!hdfcConfigured()) {
    throw new Error('HDFC payment gateway is not configured');
  }
  return hdfcGet(`/orders/${encodeURIComponent(orderId)}`, { routingId: customerId });
}

/** Verify signed return_url params using RESPONSE_KEY (HMAC-SHA256). */
export function verifyReturnSignature(params) {
  const secret = CFG.responseKey;
  if (!secret) return true; // skip if not configured
  const signature = params.signature;
  const algorithm = params.signature_algorithm || 'HMAC-SHA256';
  if (!signature || algorithm !== 'HMAC-SHA256') return false;

  const pairs = Object.keys(params)
    .filter((k) => k !== 'signature' && k !== 'signature_algorithm' && params[k] != null && params[k] !== '')
    .sort()
    .map((k) => `${k}=${params[k]}`);

  const encoded = encodeURIComponent(pairs.join('&'));
  const hash = crypto.createHmac('sha256', secret).update(encoded).digest('base64');
  const received = decodeURIComponent(String(signature));
  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(received));
  } catch {
    return hash === received;
  }
}

export function isPaidStatus(status) {
  return String(status || '').toUpperCase() === 'CHARGED';
}

export { CFG as hdfcConfig };
