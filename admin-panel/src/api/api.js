import axios from "axios";

const PRIMARY_WEB_BACKEND = import.meta.env.VITE_WEB_BASE_URI;
const SECONDARY_WEB_BACKEND = import.meta.env.VITE_WEB_BASE_URI2;

const PRIMARY_ADMIN_BACKEND = import.meta.env.VITE_ADMIN_BASE_URI;
const SECONDARY_ADMIN_BACKEND = import.meta.env.VITE_ADMIN_BASE_URI2;



export const webApi = axios.create({
  baseURL: PRIMARY_WEB_BACKEND,
  withCredentials: true,
});

export const adminApi = axios.create({
  baseURL: PRIMARY_ADMIN_BACKEND,
  withCredentials: true
})


// { Product APIs }
export const getProducts = ({ skip = 0, category, limit, title, productId, productIds, inStock, deletedItems }) => {
  const params = new URLSearchParams();

  params.append('skip', skip);
  if (category) params.append('category', category);
  if (limit) params.append('limit', limit);
  if (title) params.append('search', title);
  if (productId) params.append('productId', productId);
  if (productIds) params.append('productIds', productIds);
  if (inStock) params.append('inStock', inStock);
  if (deletedItems) params.append('deletedItems', deletedItems);

  return webApi.get(`/products?${params.toString()}`);

};

export const addProduct = (data) =>
  adminApi.post("/add-new-product", data, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

export const getAllCategory = () => webApi.get('/category-list');

export const deleteProductById = ({ productId }) => adminApi.post("/delete-product", { productId });
export const restoreProduct = ({ productId }) => adminApi.post("/restore-product", { productId });

export const getSingleProduct = ({ productId }) => webApi.get(`/products?productId=${productId}`);

export const updateProduct = (productId, data) =>
  adminApi.patch(`/update-product/${productId}`, data, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });


// {Order APIs}
export const getOrders = ({ skip = 0, status, paymentMethod, search }) => {
  const params = new URLSearchParams();

  params.append('skip', skip);
  if (status) params.append('status', status);
  if (paymentMethod) params.append('paymentMethod', paymentMethod);
  if (search) params.append('search', search);

  return adminApi.get(`/get-orders?${params.toString()}`);
}

export const getRecentOrders = () => adminApi.get("/get-recent-order");

export const updateStatus = ({ status, orderId }) => adminApi.patch(`/update-order/status/${orderId}`, { status });

export const deleteOrder = ({ orderId }) => adminApi.delete(`/delete-order/${orderId}`);

export const getOrdersById = ({userId, limit, skip}) => webApi.get(`/get-orders?userId=${userId}&limit=${limit}&skip=${skip}`);
export const getAddress = ({userId}) => webApi.get(`/get-address?userId=${userId} `);


// {Auth APIs} 
export const emailLogin = ({ email, password }) => adminApi.post('/auth/email-login', { email, password });

export const refreshAccessToken = () => adminApi.post('/auth/refresh');

export const getCurrentUser = () => adminApi.get('/auth/get-current-user');

export const logoutUser = () => adminApi.post('/auth/logout');


// { Customer APIs }
export const getAllUsers = ({ skip, role, status, search }) => {
  const params = new URLSearchParams();

  params.append('skip', skip);
  if (role) params.append('role', role);
  if (status) params.append('status', status);
  if (search) params.append('search', search);

  return adminApi.get(`/customers/get-users?${params.toString()}`);
}

export const updateUserRole = ({role, userId}) => adminApi.post("/customers/update-role", {role, userId});

export const updateCustomerStatus = ({userId, status}) => adminApi.patch(`/customers/update-status/${userId}`, {status});

export const getAnalytics = ({salesRange, orderRange}) => adminApi.get(`/get-analytics?salesRange=${salesRange}&orderRange=${orderRange}`);

// { Refresh Auth }
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, response = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(response);
    }
  });

  failedQueue = [];
};

adminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // =========================
    // BACKEND FAILOVER
    // =========================
    const shouldFallback =
      !originalRequest._fallbackTried &&
      (
        !error.response || // network error
        error.code === "ECONNABORTED" || // timeout
        error.response?.status === 502 ||
        error.response?.status === 503 ||
        error.response?.status === 504
      );

    if (shouldFallback) {
      originalRequest._fallbackTried = true;

      const currentBase =
        originalRequest.baseURL || adminApi.defaults.baseURL;

      const newBase =
        currentBase === PRIMARY_ADMIN_BACKEND
          ? SECONDARY_ADMIN_BACKEND
          : PRIMARY_ADMIN_BACKEND;

      // switch current request
      originalRequest.baseURL = newBase;

      // switch future requests
      adminApi.defaults.baseURL = newBase;

      try {
        return await adminApi(originalRequest);
      } catch (retryError) {
        return Promise.reject(retryError);
      }
    }

    if (originalRequest.url.includes("/auth/email-login")) {
      return Promise.reject(error);
    }

    // =========================
    // TOKEN REFRESH
    // =========================
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => adminApi(originalRequest));
      }

      isRefreshing = true;

      try {
        await refreshAccessToken();
        processQueue(null);
        return adminApi(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

webApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // =========================
    // WEB BACKEND FAILOVER
    // =========================
    const shouldFallback =
      !originalRequest._fallbackTried &&
      (
        !error.response || // network error
        error.code === "ECONNABORTED" || // timeout
        error.response?.status === 502 ||
        error.response?.status === 503 ||
        error.response?.status === 504
      );

    if (shouldFallback) {
      originalRequest._fallbackTried = true;

      const currentBase =
        originalRequest.baseURL || webApi.defaults.baseURL;

      const newBase =
        currentBase === PRIMARY_WEB_BACKEND
          ? SECONDARY_WEB_BACKEND
          : PRIMARY_WEB_BACKEND;

      // switch current request
      originalRequest.baseURL = newBase;

      // switch future requests
      webApi.defaults.baseURL = newBase;

      try {
        return await webApi(originalRequest);
      } catch (retryError) {
        return Promise.reject(retryError);
      }
    }
  }
)