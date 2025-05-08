import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../Features/userSlice";
import otpReducer from "../Features/otpSlice";
import adminReducer from "../Features/adminSlice";
import categoryReducer from "../Features/categorySlice";
import courseReducer from "../Features/courseSlice";
import lessonReducer from "../Features/lessonSlice";
import courseBundleReducer from "../Features/courseBundleSlice";
import wishlistReducer from "../Features/wishlistSlice";
import cartReducer from "../Features/cartSlice";
import enrollmentReducer from "../Features/enrollmentSlice";
import orderReducer from "../Features/orderSlice";
import reviewReducer from "../Features/reviewSlice";
import classReducer from "../Features/classSlice";
import webRTCReducer from "../Features/webRTCSlice";
import notificationReducer from "../Features/notificationSlice";
import chatReducer from "../Features/chatSlice";
import couponReducer from "../Features/couponSlice";
import dashboardReducer from "../Features/dashboardSlice";
import salesReportReducer from "../Features/salesReportSlice";
import { createSerializableStateInvariantMiddleware } from "@reduxjs/toolkit";
const serializableMiddleware = createSerializableStateInvariantMiddleware({
  ignoredActions: [
    "webRTC/setupLocalStream/fulfilled",
    "webRTC/addRemoteStream",
    "webRTC/shareScreen/fulfilled",
  ],
  ignoredPaths: [
    "webRTC.localStream",
    "webRTC.remoteStreams",
    "webRTC.screenSharingStream",
    "webRTC.peerConnections",
  ],
});
const store = configureStore({
  reducer: {
    user: userReducer,
    otp: otpReducer,
    admin: adminReducer,
    category: categoryReducer,
    course: courseReducer,
    lesson: lessonReducer,
    bundle: courseBundleReducer,
    wishlist: wishlistReducer,
    cart: cartReducer,
    enrollment: enrollmentReducer,
    order: orderReducer,
    review: reviewReducer,
    class: classReducer,
    webRTC: webRTCReducer,
    notification: notificationReducer,
    chat: chatReducer,
    coupon: couponReducer,
    dashboard: dashboardReducer,
    salesReport: salesReportReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(serializableMiddleware),
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
