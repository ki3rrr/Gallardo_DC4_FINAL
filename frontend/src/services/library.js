import api from './api';

export const authApi = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  logout: () => api.post('/logout'),
  me: () => api.get('/user'),
};

export const dashboardApi = {
  get: () => api.get('/dashboard'),
};

/** Generic CRUD helper for simple JSON resources. */
const crud = (path) => ({
  list: (params) => api.get(path, { params }),
  create: (data) => api.post(path, data),
  update: (id, data) => api.put(`${path}/${id}`, data),
  remove: (id) => api.delete(`${path}/${id}`),
});

export const authorsApi = crud('/authors');
export const categoriesApi = crud('/categories');
export const membersApi = crud('/members');

/** Books use multipart FormData (cover image). Laravel needs POST + _method=PUT for updates. */
export const booksApi = {
  list: (params) => api.get('/books', { params: { per_page: 30, ...params } }),
  create: (formData) => api.post('/books', formData),
  update: (id, formData) => {
    formData.append('_method', 'PUT');
    return api.post(`/books/${id}`, formData);
  },
  remove: (id) => api.delete(`/books/${id}`),
};

export const borrowingsApi = {
  list: (params) => api.get('/borrowings', { params }),
  request: (bookId) => api.post('/borrowings', { book_id: bookId }),
  setStatus: (id, payload) => api.patch(`/borrowings/${id}/status`, payload),
  remove: (id) => api.delete(`/borrowings/${id}`),
};
