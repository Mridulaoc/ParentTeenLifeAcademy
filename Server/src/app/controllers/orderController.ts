import { Request, Response } from "express";
import { instance } from "../../config/razorpayConfig";
import crypto from "crypto";
import { IUser } from "../../domain/entities/User";
import { UserModel } from "../../infrastructure/database/userModel";
import { OrderRepository } from "../../domain/repositories/orderRepository";
import { EnrollUserUsecase } from "../../domain/usecases/enrollUserUseCase";
import { UserRepository } from "../../domain/repositories/userRepository";
import { CourseRepository } from "../../domain/repositories/courseRepository";
import { AdminRepository } from "../../domain/repositories/adminRepository";
import { BundleModel } from "../../infrastructure/database/courseBundleModel";
import { sendOrderConfirmationEmail } from "../../infrastructure/services/emailService";
import { FetchUserOrdersUseCase } from "../../domain/usecases/fetchUserOrdersUseCase";
import { TimeLimitedBundleEnrollmentUseCase } from "../../domain/usecases/timeLimitedBundleEnrollmentUseCase";
import { OrderModel } from "../../infrastructure/database/orderModel";
import { PermanentBundleEnrollmentUseCase } from "../../domain/usecases/permenentBundleEnrollmentUseCase";
import { CourseBundleRepository } from "../../domain/repositories/courseBundleRepository";
import { GetAllOrdersUseCase } from "../../domain/usecases/getAllOrdersUseCase";
import { ProcessRefundUseCase } from "../../domain/usecases/processRefundUseCase";
import { CouponModel } from "../../infrastructure/database/couponModel";
import { GetSalesReportUseCase } from "../../domain/usecases/getSalesReportUseCase";

const orderRepository = new OrderRepository();
const userRepository = new UserRepository();
const courseRepository = new CourseRepository();
const adminRepository = new AdminRepository();
const courseBundleRepository = new CourseBundleRepository();

const enrollmentUseCase = new EnrollUserUsecase(
  adminRepository,
  userRepository,
  courseRepository
);

const fetchUserOrdersUseCase = new FetchUserOrdersUseCase(userRepository);
const timeLimitedBundleEnrollmentUseCase =
  new TimeLimitedBundleEnrollmentUseCase(userRepository, courseRepository);
const permanentBundleEnrollmentUseCase = new PermanentBundleEnrollmentUseCase(
  userRepository,
  courseRepository,
  courseBundleRepository
);

const getAllOrdersUseCase = new GetAllOrdersUseCase(orderRepository);
const processRefundUseCase = new ProcessRefundUseCase(orderRepository);

const getSalesReportUseCase = new GetSalesReportUseCase(orderRepository);

export const getKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const razorpayApiKey = process.env.RAZORPAY_API_KEY;

    if (!razorpayApiKey) {
      res.status(500).json({
        error: "RAZORPAY_API_KEY is not set in the environment variables",
      });
      return;
    }
    res.status(200).json({ key: razorpayApiKey });
  } catch (error) {
    res.status(500).json({ error: "An unexpected error occurred" });
  }
};

export const createOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      amount,
      currency,
      billingAddress,
      subtotal,
      discount,
      tax,
      couponCode,
    } = req.body;

    const user = req.user as IUser;
    if (!user || !user._id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const userId = user._id.toString();

    const items = await orderRepository.getCartItems(userId);

    let couponDetails = undefined;
    if (couponCode) {
      try {
        const coupon = await CouponModel.findOne({
          code: couponCode,
          expiryDate: { $gt: new Date() },
        });

        if (!coupon) {
          res.status(400).json({ error: "Invalid or expired coupon" });
          return;
        }

        const userWithCoupon = await UserModel.findOne({
          _id: userId,
          usedCoupons: coupon._id,
        });

        if (userWithCoupon) {
          res.status(400).json({ error: "Coupon already used" });
          return;
        }

        couponDetails = {
          code: coupon.code,
          discountType: coupon.discountType as "fixed" | "percentage",
          discountValue: coupon.discountValue,
          expiryDate: coupon.expiryDate,
        };
      } catch (couponError) {
        console.error("Coupon processing error:", couponError);
        res.status(400).json({ error: "Error processing coupon" });
        return;
      }
    }
    const razorpayAmount = Math.round(Number(amount));
    if (isNaN(razorpayAmount) || razorpayAmount <= 0) {
      res.status(400).json({ error: "Invalid amount value" });
      return;
    }

    const options = {
      amount: razorpayAmount,
      currency,
    };

    let razorpayOrder;
    try {
      razorpayOrder = await instance.orders.create(options);
    } catch (razorpayError) {
      console.error("Razorpay order creation error:", razorpayError);
      res.status(500).json({
        error: "Error creating payment order",
      });
    }

    if (!razorpayOrder || !razorpayOrder.id) {
      res.status(500).json({ error: "Order not created properly" });
      return;
    }

    const formattedBillingAddress =
      typeof billingAddress === "string"
        ? billingAddress
        : `${billingAddress.line1}, ${
            billingAddress.line2 ? billingAddress.line2 + ", " : ""
          }${billingAddress.city}, ${billingAddress.state}, ${
            billingAddress.country
          }, ${billingAddress.postalCode || billingAddress.pincode}`;

    const orderData = {
      orderId: razorpayOrder.id,
      amount: amount / 100,
      userId,
      items,
      billingAddress: formattedBillingAddress,
      status: "Pending",
      paymentStatus: "Pending",
      subtotal,
      discount,
      tax,
      coupon: couponDetails,
    };
    await orderRepository.createOrder(orderData);

    res.status(200).json({ orderId: razorpayOrder.id });
  } catch (error) {
    res.status(500).json({ error: "Error creating order" });
  }
};

export const verifyAndSaveOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      const order = await OrderModel.findOne({
        orderId: req.body.razorpay_order_id || req.query.orderId,
      });

      if (order) {
        if (order.status === "Pending" && order.paymentStatus === "Pending") {
          order.status = "Cancelled";
          order.paymentStatus = "Payment Cancelled";
          order.updatedAt = new Date();
          await order.save();
        }

        res.status(400).json({
          success: false,
          message: "Invalid payment details provided",
          redirectTo: order
            ? `/payment-cancelled?orderId=${order.orderId}`
            : undefined,
        });
        return;
      }
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    if (!process.env.RAZORPAY_API_SECRET) {
      throw new Error(
        "RAZORPAY_API_SECRET is not defined in environment variables"
      );
    }
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = razorpay_signature === expectedSignature;
    if (!isAuthentic) {
      await orderRepository.updateOnFailure(razorpay_order_id);
      res.status(400).json({
        success: false,
        message: "Signature verification failed",
        redirectTo: `/payment-failed?orderId=${razorpay_order_id}&error=signature_verification_failed`,
      });
      return;
    }

    const paymentDetails = await instance.payments.fetch(razorpay_payment_id);

    if (paymentDetails.status !== "captured") {
      await orderRepository.updateOnFailure(razorpay_order_id);
      res.status(400).json({
        success: false,
        message: "Payment not captured",
        redirectTo: `/payment-failed?orderId=${razorpay_order_id}&error=payment_not_captured`,
      });
      return;
    }

    const order = await OrderModel.findOne({ orderId: razorpay_order_id });
    if (
      !order ||
      order.status !== "Pending" ||
      order.paymentStatus !== "Pending"
    ) {
      res.status(400).json({
        success: false,
        message: "Order not found or not in pending state",
        redirectTo: `/payment-cancelled?orderId=${razorpay_order_id}`,
      });
      return;
    }

    order.status = "Completed";
    order.paymentStatus = "Payment Successfull";
    order.paymentId = razorpay_payment_id;
    order.paymentSignature = razorpay_signature;
    order.updatedAt = new Date();
    await order.save();

    const userId = order.userId.toString();

    try {
      if (order.coupon && order.coupon.code) {
        const coupon = await CouponModel.findOne({ code: order.coupon.code });
        if (coupon) {
          await UserModel.findByIdAndUpdate(
            userId,
            { $addToSet: { usedCoupons: coupon._id } },
            { new: true }
          );
        }
      }
    } catch (couponError) {
      console.error("Error processing coupon:", couponError);
    }

    for (const item of order.items!) {
      if (item.itemType === "Course") {
        await enrollmentUseCase.execute(
          order.userId.toString(),
          item.itemId.toString(),
          "auto"
        );
      } else if (item.itemType === "Bundle") {
        const bundle = await BundleModel.findById(item.itemId);
        if (bundle) {
          if (bundle.accessType === "limited") {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + bundle.accessPeriodDays!);
            const courseIds = bundle.courses.map((courseId) =>
              courseId.toString()
            );

            await timeLimitedBundleEnrollmentUseCase.execute(
              order.userId.toString(),
              bundle._id.toString(),
              courseIds,
              expiryDate,
              "auto"
            );
          } else {
            const courseIds = bundle.courses.map((courseId) =>
              courseId.toString()
            );

            await permanentBundleEnrollmentUseCase.execute(
              order.userId.toString(),
              bundle._id.toString(),
              courseIds,
              "auto"
            );
          }
        }
      }
    }

    await UserModel.findByIdAndUpdate(order.userId, {
      cart: [],
      cartTotal: 0,
    });

    sendOrderConfirmationEmail(order, razorpay_payment_id).catch((err) => {
      console.error("Failed to send confirmation email:", err);
    });

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      redirectTo: `/paymentSuccess?reference=${razorpay_payment_id}`,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
export const confirmPayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { orderId } = req.body;
    await orderRepository.updateOnSuccess(orderId);
    res.status(200).json({ success: true });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error confirming payment" });
  }
};

export const cancelPayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { orderId, reason } = req.body;

    if (!orderId) {
      res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
      return;
    }

    const user = req.user as IUser;
    if (!user || !user._id) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const order = await OrderModel.findOne({
      orderId: orderId,
      userId: user._id,
    });

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });
      return;
    }

    if (order.status !== "Pending" || order.paymentStatus !== "Pending") {
      res.status(400).json({
        success: false,
        message: `Cannot update order with status: ${order.status}. Only pending orders can be updated.`,
      });
      return;
    }

    if (reason === "payment_failed") {
      order.status = "Failed";
      order.paymentStatus = "Payment Failed";
    } else {
      order.status = "Cancelled";
      order.paymentStatus = "Payment Cancelled";
    }
    order.updatedAt = new Date();
    await order.save();

    res.status(200).json({
      success: true,
      message: `Order ${
        reason === "payment_failed" ? "failed" : "cancelled"
      } successfully`,
      order: {
        orderId: order.orderId,
        status: order.status,
        paymentStatus: order.paymentStatus,
      },
    });
  } catch (error) {
    console.error("Cancel payment error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating order",
    });
  }
};

export const getUserOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as IUser;
    if (!user || !user._id) {
      res.status(401).json({ message: "Unauthorized" });
    }
    const userId = user._id.toString();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const { orders, total } = await fetchUserOrdersUseCase.execute(
      page,
      limit,
      userId
    );
    res.status(200).json({ orders, total, page, limit });
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders" });
  }
};

export const retryPayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { orderId } = req.body;
    const user = req.user as IUser;

    if (!user || !user._id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const order = await OrderModel.findOne({
      orderId: orderId,
      userId: user._id,
      paymentStatus: "Payment Failed",
    });

    if (!order) {
      res.status(404).json({ message: "Order not found or already processed" });
      return;
    }

    const options = {
      amount: order.amount * 100,
      currency: "INR",
    };

    const newRazorpayOrder = await instance.orders.create(options);

    order.orderId = newRazorpayOrder.id;
    order.paymentStatus = "Pending";
    order.status = "Pending";
    await order.save();

    res.status(200).json({
      orderId: newRazorpayOrder.id,
      amount: order.amount * 100,
    });
  } catch (error) {
    console.error("Retry payment error:", error);
    res.status(500).json({ error: "Error retrying payment" });
  }
};

export const requestRefund = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { orderId } = req.params;

    const user = req.user as IUser;
    if (!user || !user._id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const order = await OrderModel.findOne({ orderId, userId: user._id });

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    if (order.paymentStatus !== "Payment Successfull") {
      res.status(400).json({
        success: false,
        message: "Only successful payments can be refunded",
      });
      return;
    }

    const hasBundleItem = order.items?.some(
      (item) => item.itemType === "Bundle"
    );
    if (!hasBundleItem) {
      res.status(400).json({
        success: false,
        message: "Only bundle purchases are eligible for refund",
      });
      return;
    }

    const orderDate = new Date(order.createdAt!);
    const currentDate = new Date();
    const refundWindowMs = 7 * 24 * 60 * 60 * 1000;

    if (currentDate.getTime() - orderDate.getTime() > refundWindowMs) {
      res.status(400).json({
        success: false,
        message: "Refund window has expired (7 days from purchase)",
      });
      return;
    }

    order.status = "Refund Requested";
    await order.save();

    if (order.paymentId) {
      const refund = await instance.payments.refund(order.paymentId, {
        amount: order.amount * 100,
        notes: {
          orderId: order.orderId,
          reason: "Customer requested refund",
        },
      });

      order.refundId = refund.id;
      order.refundStatus = "Initiated";
      await order.save();
    }

    for (const item of order.items!) {
      if (item.itemType === "Bundle") {
        await UserModel.updateOne(
          { _id: user._id },
          {
            $pull: {
              enrolledBundles: { bundleId: item.itemId },
            },
          }
        );

        const bundle = await BundleModel.findById(item.itemId);
        if (bundle) {
          for (const courseId of bundle.courses) {
            await UserModel.updateOne(
              { _id: user._id },
              {
                $pull: {
                  enrolledCourses: {
                    courseId: courseId,
                    bundleId: item.itemId,
                  },
                },
              }
            );
          }
        }
      }
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error processing refund request:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your refund request",
    });
  }
};

export const processRefund = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { orderId } = req.body;

    const order = await processRefundUseCase.execute(orderId);
    if (!order) {
      res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while processing refund",
    });
  }
};

export const getALLOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getAllOrdersUseCase.execute(page, limit);
    if (!result) {
      throw new Error("Could not fetch orders");
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getSalesReport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({ message: "Invalid date format" });
      return;
    }

    const salesReport = await getSalesReportUseCase.execute(start, end);

    res.status(200).json(salesReport);
  } catch (error) {
    res.status(500).json({ message: "Failed to generate sales report" });
  }
};
