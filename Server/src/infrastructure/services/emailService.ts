import nodemailer from "nodemailer";
import { IOrder } from "../../domain/entities/order";
import { UserModel } from "../database/userModel";

export const sendOTPEmail = async (
  email: string,
  otp: string
): Promise<void> => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  await transporter.sendMail({
    from: "Parent Teen Life Academy <parentteen2025@gmail.com>",
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is: ${otp}`,
  });
};

export const sendOrderConfirmationEmail = async (
  order: IOrder,
  paymentId: string
): Promise<void> => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const user = await UserModel.findById(order.userId);
  if (!user) {
    throw new Error("User not found");
  }
  const itemsList = order
    .items!.map((item) => `<li>${item.title} - ₹${item.price}</li>`)
    .join("");

  await transporter.sendMail({
    from: '"Parent TeenLife Academy" <parentteen2025@gmail.com>',
    to: user.email,
    subject: "Your Course Purchase Confirmation",
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Thank you for your purchase!</h2>
          <p>Dear ${user.firstName} ${user.lastName},</p>
          <p>Your payment has been successfully processed. Here are your order details:</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Payment ID:</strong> ${paymentId}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Amount:</strong> ₹${order.amount}</p>
          </div>
          
          <h3>Purchased Items:</h3>
          <ul>
            ${itemsList}
          </ul>
          
          <p>Your courses have been added to your account. You can access them by logging into your dashboard.</p>
          
          <a href="http://localhost:5173/dashboard" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">Access Your Courses</a>
          
          <p style="margin-top: 30px;">If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>Parent TeenLife Academy Team</p>
        </div>
      `,
  });
};
