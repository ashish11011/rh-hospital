"use client";
import { Button } from "@/components/ui/button";
import axios from "axios";
import React from "react";

const Payment = () => {
  async function oncliclHandler() {
    const req = await axios.post(
      "https://smartgateway.hdfcuat.bank.in/session",
      {
        order_id: "asdf",
        amount: 100,
        customer_id: "user",
        customer_email: "mail@madsif.com",
        customer_phone: "12398123",
        payment_page_client_id: "hdfcmaster",
        action: "paymentPage",
        currency: "INR",
        return_url: "https://localhost:3000/success",
        description: "Complete your payment",
        first_name: "John",
        last_name: "wick",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic QTZEM0FBNEZGODU0OUNFQTVCMDU3RDQ2NEMxOTBF`,
          "x-merchantid": "SG4962",
          "x-customerid": "123456",
        },
      },
    );
  }

  return (
    <div>
      <Button onClick={oncliclHandler}>Pay</Button>
    </div>
  );
};

export default Payment;
