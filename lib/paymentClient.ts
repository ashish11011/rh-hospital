import Razorpay from "razorpay";
import { RAZORPAY_KEY, RAZORPAY_KEY_SECRET } from "../env";
export var paymentClient = new Razorpay({
    key_id: RAZORPAY_KEY,
    key_secret: RAZORPAY_KEY_SECRET,
});