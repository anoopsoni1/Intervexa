import crypto from "crypto";
import axios from "axios";
import dotenv from "dotenv";
import { Asynchandler } from "../utils/Asynchandler.js";

dotenv.config();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

/** ₹99 in paise */
const PAYMENT_AMOUNT_PAISE = 9 * 100;

function getRazorpayAuthHeader() {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new Error("Internal Servor Error");
  }
  return Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");
}

function generateOrderId() {
  const uniqueId = crypto.randomBytes(16).toString("hex");
  return crypto.createHash("sha256").update(uniqueId).digest("hex").substr(0, 12);
}

export const Payment = Asynchandler(async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Name and Email are required" });
  }

  try {
    const receipt = `r_${generateOrderId()}`.slice(0, 40);
    const { data } = await axios.post(
      "https://api.razorpay.com/v1/orders",
      {
        amount: PAYMENT_AMOUNT_PAISE,
        currency: "INR",
        receipt,
        notes: { name, email },
      },
      {
        headers: {
          Authorization: `Basic ${getRazorpayAuthHeader()}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      keyId: RAZORPAY_KEY_ID,
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
    });
  } catch (error) {
    const msg =
      error.response?.data?.error?.description ||
      error.response?.data?.message ||
      error.message;
    res.status(500).json({ error: msg });
  }
});

export const VerifyPayment = Asynchandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({
      verified: false,
      error: "razorpay_order_id, razorpay_payment_id, and razorpay_signature are required",
    });
  }

  try {
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({ verified: false, error: "Invalid payment signature" });
    }

    let paymentDetails = null;
    try {
      const { data } = await axios.get(
        `https://api.razorpay.com/v1/payments/${razorpay_payment_id}`,
        {
          headers: {
            Authorization: `Basic ${getRazorpayAuthHeader()}`,
          },
        }
      );
      paymentDetails = data;
    } catch {
      // Optional: signature already verified
    }

    const amountRupees =
      paymentDetails?.amount != null ? paymentDetails.amount / 100 : PAYMENT_AMOUNT_PAISE / 100;
    const rawStatus = paymentDetails?.status || "captured";
    const payment_status =
      rawStatus === "captured" || rawStatus === "authorized" ? "success" : rawStatus;

    res.json({
      verified: true,
      payment_status,
      payment: {
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        amount: amountRupees,
        currency: paymentDetails?.currency || "INR",
        method: paymentDetails?.method,
        status: paymentDetails?.status,
        created_at: paymentDetails?.created_at,
        email: paymentDetails?.email,
        contact: paymentDetails?.contact,
      },
    });
  } catch (error) {
    res.status(500).json({
      verified: false,
      error: error.response?.data?.message || error.message,
    });
  }
});
