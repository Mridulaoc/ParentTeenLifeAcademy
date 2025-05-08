import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";

import {
  UserProtectedRoute,
  AdminProtectedRoute,
} from "./components/protectedRoute";
import { MainLayout } from "./components/mainLayOut";
import Home from "./Pages/home";
import Login from "./Pages/login";
import SignupForm from "./Pages/signupForm";
import { DashboardLayout } from "./components/dashboardLayout";
import { Profile } from "./Pages/profile";
import { AdminLayout } from "./components/adminLayOut";
import AdminLogin from "./Pages/adminLogin";
import AdminDashboard from "./Pages/adminDashboard";
import Settings from "./Pages/settings";
import OtpPage from "./Pages/otpPage";
import { ForgotPassword } from "./Pages/forgotPassword";
import { VerifyOTP } from "./Pages/verifyOTP";
import { ResetPassword } from "./Pages/resetPassword";
import { AdminDashboardLayout } from "./components/adminDashboard";
import UserManagement from "./Pages/users";
import CategoryManagement from "./Pages/categories";
import AddCategory from "./Pages/addCategory";
import EditCategory from "./Pages/editCategory";
import { CourseForm } from "./Pages/courseForm";
import CourseLessons from "./Pages/lessons";
import CourseManagement from "./Pages/courses";
import LessonsList from "./Pages/lessonList";
import { EditCourse } from "./Pages/editCourse";
import Courses from "./Pages/coursePage";
import CourseDetails from "./Pages/courseDetails";
import BundleCreation from "./Pages/bundleCreation";
import BundleManagement from "./Pages/bundles";
import BundleEdit from "./Pages/editBundle";
import CartPage from "./Pages/cart";
import CheckoutPage from "./Pages/checkout";
import WishlistPage from "./Pages/wishlist";
import BundleDetails from "./Pages/bundleDetails";
import ManualEnrollmentPage from "./Pages/manualEnrollment";
import PaymentSuccessPage from "./Pages/paymentSuccessPage";
import OrderHistory from "./Pages/orderHistory";
import CourseLearning from "./Pages/courseLearning";
import ScheduleClass from "./Pages/scheduleClass";
import ClassRoom from "./Pages/classRoom";
import Join from "./components/joinLive";
import LiveClassDetails from "./Pages/liveclassDetails";
import CreateNotification from "./Pages/createNotification";
import NotificationManagement from "./Pages/notificationList";
import NotificationsPage from "./Pages/notificationPage";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "./Store/store";
import { useEffect } from "react";

import {
  initializeChatSocket,
  disconnectChatSocket,
} from "./Services/chatSocketService";
import ChangePasswordForm from "./Pages/changePassword";
import StudentChat from "./Pages/studentChatPage";
import AdminChat from "./Pages/adminChatPage";
import { useDispatch } from "react-redux";
import {
  disconnectNotificationSocket,
  initializeNotificationSocket,
} from "./Services/notificationSocketService";
import {
  disconnectWebRTCSocket,
  initializeWebRTCSocket,
} from "./Services/webrtcSocketService";
import EnrolledCourses from "./Pages/dashboard";
import CouponCreationForm from "./Pages/couponCreationForm";
import CouponManagement from "./Pages/couponList";
import EditCoupon from "./Pages/editCoupon";
import ReviewManagement from "./Pages/reviwList";
import PaymentFailedPage from "./Pages/paymnetFailedPage";
import PaymentCancelledPage from "./Pages/paymentCancelledPage";
import OrderManagement from "./Pages/orderList";
import SalesReport from "./Pages/salesReport";

export default function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { admin: adminId, token: adminToken } = useSelector(
    (state: RootState) => state.admin
  );

  const { user, token } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const isAdminRoute = window.location.pathname.startsWith("/admin");

    if (isAdminRoute && adminId && adminToken) {
      initializeChatSocket(adminId, adminToken, true);
      initializeNotificationSocket(adminId, adminToken, true);
      initializeWebRTCSocket(adminId, adminToken, true);
    } else if (!isAdminRoute && user?._id && token) {
      initializeChatSocket(user._id, token, false);
      initializeNotificationSocket(user._id, token, false);
      initializeWebRTCSocket(user._id, token, false);
    }

    return () => {
      if (isAdminRoute && adminId && adminToken) {
        disconnectChatSocket();
        disconnectNotificationSocket();
        disconnectWebRTCSocket();
      } else if (!isAdminRoute && user?._id && token) {
        disconnectChatSocket();
        disconnectNotificationSocket();
        disconnectWebRTCSocket();
      }
    };
  }, [user?._id, token, adminId, adminToken, dispatch]);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="join" element={<Join />} />
          <Route path="room/:roomId" element={<ClassRoom />} />

          <Route path="login" element={<Login />} />
          <Route path="register" element={<SignupForm />} />
          <Route path="otp/:userId" element={<OtpPage />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="verify-otp/:userId" element={<VerifyOTP />} />
          <Route path="reset-password/:userId" element={<ResetPassword />} />
          <Route path="paymentSuccess" element={<PaymentSuccessPage />} />
          <Route path="payment-failed" element={<PaymentFailedPage />} />
          <Route path="payment-cancelled" element={<PaymentCancelledPage />} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:courseId" element={<CourseDetails />} />
          <Route
            path="/courses/:courseId/liveClassDetails"
            element={
              <UserProtectedRoute>
                <LiveClassDetails />
              </UserProtectedRoute>
            }
          />
          <Route
            path="courses/:courseId/learn"
            element={
              <UserProtectedRoute>
                <CourseLearning />
              </UserProtectedRoute>
            }
          />
          <Route path="bundles/:bundleId" element={<BundleDetails />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route
            path="dashboard"
            element={
              <UserProtectedRoute>
                <DashboardLayout />
              </UserProtectedRoute>
            }
          >
            <Route index element={<EnrolledCourses />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="order-history" element={<OrderHistory />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="change-password" element={<ChangePasswordForm />} />
            <Route path="chat" element={<StudentChat />} />
          </Route>
        </Route>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminLogin />} />
          <Route
            path="dashboard"
            element={
              <AdminProtectedRoute>
                <AdminDashboardLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="categories/add" element={<AddCategory />} />
            <Route path="categories/edit/:id" element={<EditCategory />} />
            <Route path="courses" element={<Outlet />}>
              <Route index element={<CourseManagement />} />
              <Route path="add" element={<CourseForm />} />
              <Route path=":courseId/lessons" element={<CourseLessons />} />
              <Route path=":courseId/lessonsList" element={<LessonsList />} />
              <Route path=":courseId" element={<EditCourse />} />
            </Route>
            <Route path="bundles" element={<Outlet />}>
              <Route index element={<BundleManagement />} />
              <Route path="add" element={<BundleCreation />} />
              <Route path=":bundleId" element={<BundleEdit />} />
            </Route>
            <Route path="enrollment" element={<Outlet />}>
              <Route index element={<ManualEnrollmentPage />} />
            </Route>
            <Route path="schedule" element={<Outlet />}>
              <Route index element={<ScheduleClass />} />
            </Route>
            <Route path="notifications" element={<Outlet />}>
              <Route index element={<NotificationManagement />} />
              <Route path="add" element={<CreateNotification />} />
            </Route>
            <Route path="chat" element={<AdminChat />} />
            <Route path="coupons" element={<Outlet />}>
              <Route index element={<CouponManagement />} />
              <Route path="add" element={<CouponCreationForm />} />
              <Route path="edit/:id" element={<EditCoupon />} />
            </Route>
            <Route path="reviews" element={<ReviewManagement />} />
            <Route path="orders" element={<Outlet />}>
              <Route index element={<OrderManagement />} />
            </Route>
            <Route path="sales-report" element={<SalesReport />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
