interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Category {
  id: number;
  name: string;
  createdAt: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  categoryId: number | null;
  authorId: number;
  createdAt: string;
  updatedAt: string;
  author?: { id: number; name: string; email: string };
  category?: { id: number; name: string } | null;
}

interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'viewer';
  createdAt: string;
}
