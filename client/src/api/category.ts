
import api from "./axios";

// Category types
export type CategoryType = "income" | "expense";

export interface Category {
  _id: string;
  userId: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryPayload {
  name: string;
  type: CategoryType;
  icon?: string;
  color?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  icon?: string;
  color?: string;
}

// API response types
interface CategoryListResponse {
  success: boolean;
  count: number;
  categories: Category[];
}

interface CategoryResponse {
  success: boolean;
  message: string;
  category: Category;
}

interface DeleteCategoryResponse {
  success: boolean;
  message: string;
}

// GET all categories
export async function fetchCategories(): Promise<Category[]> {
  const response = await api.get<CategoryListResponse>("/categories");

  return response.data.categories;
}

// CREATE custom category
export async function createCategory(
  data: CreateCategoryPayload
): Promise<Category> {
  const response = await api.post<CategoryResponse>(
    "/categories",
    data
  );

  return response.data.category;
}

// UPDATE category
export async function updateCategory(
  id: string,
  data: UpdateCategoryPayload
): Promise<Category> {
  const response = await api.put<CategoryResponse>(
    `/categories/${id}`,
    data
  );

  return response.data.category;
}

// DELETE custom category
export async function deleteCategory(
  id: string
): Promise<void> {
  await api.delete<DeleteCategoryResponse>(`/categories/${id}`);
}
