import axios from "axios";

export const webApi = axios.create({
  baseURL: import.meta.env.VITE_WEB_BASE_URI
});

export const adminApi = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_BASE_URI
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
