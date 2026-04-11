import axios from "axios";

export const webApi = axios.create({
  baseURL: import.meta.env.VITE_WEB_BASE_URI,
  withCredentials: true,
});

export const adminApi = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_BASE_URI,
  withCredentials: true,
})

export const getProducts = ({ skip = 0, category, limit, title, productId, productIds, inStock }) => {
  const params = new URLSearchParams();

  params.append('skip', skip);       // always add skip
  if (category) params.append('category', category); // only if defined
  if (limit) params.append('limit', limit);
  if (title) params.append('search', title);
  if (productId) params.append('productId', productId);
  if (productIds) params.append('productIds', productIds);
  if (inStock) params.append('inStock', inStock);

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

export const getSingleProduct = ({ productId }) => webApi.get(`/products?productId=${productId}`);

export const updateProduct = (productId, data) =>
  adminApi.patch(`/update-product/${productId}`, data, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });


// {auth apis} 

export const emailLogin = ({email, password}) => adminApi.post('/auth/email-login', {email, password});

export const refreshAccessToken = () => webApi.post('/auth/refresh');

export const getCurrentUser = () => webApi.get('/auth/get-current-user');

export const logoutUser = () => webApi.post('/auth/logout');

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

webApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => webApi(originalRequest));
      }

      isRefreshing = true;

      try {
        await refreshAccessToken();
        processQueue(null);
        return webApi(originalRequest);
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