import axios, { AxiosError } from "axios";

interface IApiErrorResponse {
  message: string;
}

const adminApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/admin`,
  withCredentials: true,
});

const userApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

userApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwtToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const generalErrorInterceptor = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const typedError = error as AxiosError<IApiErrorResponse>;
    if (
      typedError.response?.status === 403 &&
      typedError.response?.data?.message ===
        "Your account has been blocked. Please contact support."
    ) {
      localStorage.removeItem("jwtToken");
      window.location.href = "/login";
    }
    return Promise.reject(
      typedError.response?.data?.message || "An error occured"
    );
  }
  return Promise.reject("An unknown error occured");
};

adminApi.interceptors.response.use(
  (response) => response,
  generalErrorInterceptor
);

userApi.interceptors.response.use(
  (response) => response,
  generalErrorInterceptor
);

export { adminApi, userApi };
