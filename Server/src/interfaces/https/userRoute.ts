import express, { Router } from "express";

import {
  registerUser,
  verifyOTP,
  resendOTP,
  login,
  googleAuth,
  tokenVerification,
  checkStatus,
  getEnrollmentStatus,
  changePassword,
} from "../../app/controllers/authController";
import passport, { authenticate } from "passport";
import { authMiddleware } from "../../app/middlewares/authMiddleware";
import {
  getUserProfile,
  updateUserProfile,
  uploadProfileImage,
} from "../../app/controllers/profileController";
import {
  forgotPassword,
  resetPassword,
  verifyResetPasswordOTP,
} from "../../app/controllers/forgotPasswordController";
import upload from "../../app/middlewares/upload";
import { checkBlocked } from "../../app/middlewares/checkBlockedMiddleware";
import {
  addToWishlist,
  getWishlist,
  removeFromWishList,
} from "../../app/controllers/wishlistController";
import {
  addToCart,
  getCart,
  getEnrolledCourses,
  removeFromCart,
} from "../../app/controllers/cartController";
import { instance } from "../../config/razorpayConfig";
import {
  cancelPayment,
  confirmPayment,
  createOrder,
  getKey,
  getUserOrders,
  requestRefund,
  retryPayment,
  // updateOrderStatus,
  verifyAndSaveOrder,
} from "../../app/controllers/orderController";
import {
  addReview,
  deleteReview,
  fetchCourseReviews,
  updateReview,
} from "../../app/controllers/reviewController";
import {
  getLessonProgress,
  updateLessonProgress,
} from "../../app/controllers/lessonProgressController";
import { generateCertificate } from "../../app/controllers/certificateController";
import {
  getAllPublicCourses,
  getCourseDetails,
  getPopularCourses,
} from "../../app/controllers/courseController";
import { getClass } from "../../app/controllers/classController";
import {
  getUnreadNotificationCount,
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../app/controllers/userNotificationController";
import {
  getAdminId,
  getChat,
  getOrCreateChat,
  getStudentChats,
} from "../../app/controllers/chatController";
import {
  fetchAllBundles,
  getBundleDetails,
} from "../../app/controllers/courseBundleController";
import { validateCoupon } from "../../app/controllers/couponController";
import { getAllCategories } from "../../app/controllers/adminController";

// Google Login Routes
const userRouter = express.Router();
userRouter.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
userRouter.post("/auth/google/token", tokenVerification);

// User Auth Routes
userRouter.post("/register", registerUser);
userRouter.post("/verify-otp", verifyOTP);
userRouter.post("/resend-otp", resendOTP);
userRouter.post("/login", login);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/verify-password-reset-otp", verifyResetPasswordOTP);
userRouter.post("/reset-password", resetPassword);
userRouter.get("/check-status", checkStatus);

userRouter.get("/courses", getAllPublicCourses);
userRouter.get("/bundles", fetchAllBundles);
userRouter.get("/bundles/:bundleId", getBundleDetails);
userRouter.get("/courses/:courseId", getCourseDetails);
userRouter.get("/popular-courses", getPopularCourses);
userRouter.get("/categories", getAllCategories);

// User dashboard Routes
userRouter.get("/profile", authMiddleware, checkBlocked, getUserProfile);
userRouter.patch("/settings", authMiddleware, checkBlocked, updateUserProfile);
userRouter.patch(
  "/upload-profile-image",
  authMiddleware,
  checkBlocked,
  upload.single("profileImage"),
  uploadProfileImage
);
userRouter.post("/wishlist", authMiddleware, checkBlocked, addToWishlist);
userRouter.get("/wishlist", authMiddleware, checkBlocked, getWishlist);
userRouter.delete(
  "/wishlist/:itemId",
  authMiddleware,
  checkBlocked,
  removeFromWishList
);

userRouter.get(
  "/enrolled-courses",
  authMiddleware,
  checkBlocked,
  getEnrolledCourses
);

userRouter.get(
  "/enrollment/status/:courseId",
  authMiddleware,
  checkBlocked,
  getEnrollmentStatus
);

userRouter.patch(
  "/:courseId/lessons/:lessonId/progress",
  authMiddleware,
  checkBlocked,
  updateLessonProgress
);

userRouter.get(
  "/:courseId/lessons/progress",
  authMiddleware,
  checkBlocked,
  getLessonProgress
);

userRouter.post(
  "/:courseId/certificate",
  authMiddleware,
  checkBlocked,
  generateCertificate
);

userRouter.post(
  "/change-password",
  authMiddleware,
  checkBlocked,
  changePassword
);

userRouter.get("/class", getClass);

// Cart Routes
userRouter.post("/cart", authMiddleware, checkBlocked, addToCart);
userRouter.get("/cart", authMiddleware, checkBlocked, getCart);
userRouter.delete(
  "/cart/:itemId",
  authMiddleware,
  checkBlocked,
  removeFromCart
);

// Review Routes
userRouter.post("/:courseId/reviews", authMiddleware, checkBlocked, addReview);
userRouter.get("/:courseId/reviews", fetchCourseReviews);
userRouter.put(
  "/:courseId/reviews/:reviewId",
  authMiddleware,
  checkBlocked,
  updateReview
);
userRouter.delete(
  "/:courseId/reviews/:reviewId",
  authMiddleware,
  checkBlocked,
  deleteReview
);

// Order-Payment Routes
userRouter.get("/getKey", authMiddleware, checkBlocked, getKey);
userRouter.post("/create-order", authMiddleware, checkBlocked, createOrder);
userRouter.post("/verify-payment", verifyAndSaveOrder);
userRouter.post("/confirm-payment", confirmPayment);
userRouter.post("/cancel-payment", authMiddleware, checkBlocked, cancelPayment);
userRouter.post("/retry-payment", authMiddleware, checkBlocked, retryPayment);
userRouter.get("/orders", authMiddleware, checkBlocked, getUserOrders);
userRouter.put("/:orderId/refund", authMiddleware, checkBlocked, requestRefund);
userRouter.post(
  "/orders/validate-coupon",
  authMiddleware,
  checkBlocked,
  validateCoupon
);

// Notification Routes
userRouter.get(
  "/:userId/notifications",
  authMiddleware,
  checkBlocked,
  getUserNotifications
);

userRouter.put(
  "/notifications/:notificationId/read",
  authMiddleware,
  checkBlocked,
  markNotificationAsRead
);

userRouter.put(
  "/notifications/read",
  authMiddleware,
  checkBlocked,
  markAllNotificationsAsRead
);

userRouter.get(
  "/notifications/unread",
  authMiddleware,
  checkBlocked,
  getUnreadNotificationCount
);

// Chat Routes

userRouter.get("/chats", authMiddleware, checkBlocked, getStudentChats);
userRouter.post("/create/chats", authMiddleware, checkBlocked, getOrCreateChat);
userRouter.get("/chats/:chatId", authMiddleware, checkBlocked, getChat);
userRouter.get("/get-adminId", authMiddleware, checkBlocked, getAdminId);

export default userRouter;
