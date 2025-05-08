import express from "express";

import {
  addCategory,
  deleteCategory,
  editCategory,
  getAllCategories,
  getAllUsers,
  getCategory,
  login,
  toggleBlockUser,
} from "../../app/controllers/adminController";
import { adminMiddleware } from "../../app/middlewares/adminMiddleware";
import {
  addNewCourse,
  deleteCourse,
  getAllCourses,
  getCourseDetails,
  updateCourseDetails,
  uploadFeaturedImage,
  uploadIntroVideo,
} from "../../app/controllers/courseController";
import upload from "../../app/middlewares/upload";
import uploadVideo from "../../app/middlewares/uploadVideo";
import {
  addLesssons,
  deleteLesson,
  getAllLessons,
  updateLesson,
} from "../../app/controllers/lessonController";
import {
  addNewBundle,
  deleteBundle,
  fetchAllBundles,
  fetchAllCourses,
  getBundleDetails,
  updateBundle,
} from "../../app/controllers/courseBundleController";
import {
  enrollUser,
  getCourses,
  getUserSuggestions,
} from "../../app/controllers/enrollmentControllers";
import { scheduleClass } from "../../app/controllers/classController";
import {
  createNotification,
  deleteNotification,
  fetchAllNotifications,
  fetchBundleForNotification,
  fetchCourseForNotification,
  fetchTargetUsersForNotification,
  fetchUsersForNotification,
} from "../../app/controllers/notificationController";
import {
  createChat,
  getAdminChats,
  getAdminId,
  getChat,
} from "../../app/controllers/chatController";
import {
  createCoupon,
  deactivateCoupon,
  getCouponById,
  getCoupons,
  updateCoupon,
} from "../../app/controllers/couponController";
import { getAllReviews } from "../../app/controllers/reviewController";
import {
  getALLOrders,
  getSalesReport,
  processRefund,
} from "../../app/controllers/orderController";
import { getDashboardStats } from "../../app/controllers/dashboardController";

const adminRouter = express.Router();
adminRouter.post("/", login);

// Dashboard Routes
adminRouter.get("/dashboard/stats", adminMiddleware, getDashboardStats);

// User Management Routes
adminRouter.get("/users", adminMiddleware, getAllUsers);
adminRouter.patch("/users/:userId", adminMiddleware, toggleBlockUser);

// Category Management Routes
adminRouter
  .route("/categories")
  .get(adminMiddleware, getAllCategories)
  .post(adminMiddleware, addCategory);

adminRouter
  .route("/categories/:id")
  .get(adminMiddleware, getCategory)
  .patch(adminMiddleware, editCategory)
  .delete(adminMiddleware, deleteCategory);

// Course Managemnet Router
adminRouter.post(
  "/upload-featured-image",
  adminMiddleware,
  upload.single("featuredImage"),
  uploadFeaturedImage
);
adminRouter.post(
  "/upload-intro-video",
  adminMiddleware,
  uploadVideo.single("video"),
  uploadIntroVideo
);
adminRouter
  .route("/courses")
  .get(adminMiddleware, getAllCourses)
  .post(adminMiddleware, addNewCourse);
adminRouter
  .route("/courses/:courseId")
  .get(adminMiddleware, getCourseDetails)
  .put(adminMiddleware, updateCourseDetails)
  .delete(adminMiddleware, deleteCourse);
adminRouter
  .route("/courses/:courseId/lessons")
  .get(adminMiddleware, getAllLessons)
  .post(adminMiddleware, addLesssons);
adminRouter
  .route("/courses/lessons/:lessonId")
  .put(adminMiddleware, updateLesson)
  .delete(adminMiddleware, deleteLesson);

// Course Bundle Management
adminRouter.get("/all-courses", adminMiddleware, fetchAllCourses);
adminRouter.post("/bundle", adminMiddleware, addNewBundle);
adminRouter.get("/bundles", adminMiddleware, fetchAllBundles);
adminRouter.delete("/bundles/:bundleId", adminMiddleware, deleteBundle);
adminRouter.put("/bundles/:bundleId", adminMiddleware, updateBundle);

// Manual Enrollment Routes
adminRouter.post("/enrollment", adminMiddleware, enrollUser);
adminRouter.get("/enrollment/users", adminMiddleware, getUserSuggestions);
adminRouter.get("/enrollment/courses", adminMiddleware, getCourses);

// Live Class Routes

adminRouter.post("/schedule-class", adminMiddleware, scheduleClass);

// Notification Routes
adminRouter.get("/all-notifications", adminMiddleware, fetchAllNotifications);
adminRouter.post("/notification", adminMiddleware, createNotification);
adminRouter.delete(
  "/notifications/:notificationId",
  adminMiddleware,
  deleteNotification
);

adminRouter.get(
  "/notifications/users",
  adminMiddleware,
  fetchUsersForNotification
);
adminRouter.get(
  "/notifications/courses",
  adminMiddleware,
  fetchCourseForNotification
);

adminRouter.get(
  "/notifications/bundles",
  adminMiddleware,
  fetchBundleForNotification
);

adminRouter.get(
  "/:entityType/:entityId/enrolledUsers",
  adminMiddleware,
  fetchTargetUsersForNotification
);
// Chat Routes
adminRouter.get("/chats", adminMiddleware, getAdminChats);
adminRouter.post("/chats/create", adminMiddleware, createChat);
adminRouter.get("/chats/:chatId", adminMiddleware, getChat);
// adminRouter.get("/adminId", getAdminId);

// Coupon Routes

adminRouter.post("/coupon", adminMiddleware, createCoupon);
adminRouter.get("/coupon", adminMiddleware, getCoupons);
adminRouter.get("/coupons/:id", adminMiddleware, getCouponById);
adminRouter.put("/coupons/:id", adminMiddleware, updateCoupon);
adminRouter.patch("/coupons/:id", adminMiddleware, deactivateCoupon);

// Reviews Router

adminRouter.get("/all-reviews", adminMiddleware, getAllReviews);

// Order Managemnet Routes

adminRouter.get("/orders", adminMiddleware, getALLOrders);
adminRouter.put("/process-refund", adminMiddleware, processRefund);
adminRouter.get("/sales-report", adminMiddleware, getSalesReport);

export default adminRouter;
