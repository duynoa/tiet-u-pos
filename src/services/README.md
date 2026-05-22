# Services Layer

## Tổng quan

Services layer dùng **TanStack Query (React Query)** + **Axios** để quản lý data fetching và caching. Mỗi feature có cấu trúc riêng.

## Cấu trúc thư mục

```
src/services/
├── index.ts           # Export tất cả services
├── lib/
│   └── axios.ts       # Cấu hình axios instance
├── news/              # Feature: Tin tức
│   ├── api.ts         # Định nghĩa API endpoints
│   ├── queries.ts     # Hooks đọc dữ liệu (useQuery)
│   └── mutations.ts   # Hooks ghi dữ liệu (useMutation)
└── [feature]/         # Thêm feature mới theo pattern này
    ├── api.ts
    ├── queries.ts
    └── mutations.ts
```

## Cách hoạt động

Mỗi feature gồm 3 layer:

```
Component → Hook (queries/mutations) → API (axios)
```

1. **Component** gọi hook từ `queries.ts` hoặc `mutations.ts`
2. **Hook** wrap TanStack Query (`useQuery` / `useMutation`)
3. **API** gọi axios đến backend

---

## API (`api.ts`)

Dùng axios instance đã cấu hình sẵn trong `src/lib/axios.ts`. Mỗi method trả về Promise.

```typescript
import api from "@/src/lib/axios";

export const featureApi = {
  getAll: (params?: any)    => api.get('/resource', { params }),
  getOne: (id: string)     => api.get(`/resource/${id}`),
  create: (data: any)       => api.post('/resource', data),
  update: (id: string, data: any) => api.patch(`/resource/${id}`, data),
  delete: (id: string)     => api.delete(`/resource/${id}`),
};
```

**HTTP methods:**
| Method | Dùng khi |
|--------|----------|
| `GET` | Lấy data (list / detail) |
| `POST` | Tạo mới |
| `PATCH` | Cập nhật một phần |
| `PUT` | Thay thế toàn bộ |
| `DELETE` | Xoá |

---

## Queries (`queries.ts`)

Dùng cho các thao tác **đọc dữ liệu**. Query tự động cache theo `queryKey` và refetch khi stale hoặc bị invalidate.

```typescript
import { useQuery } from "@tanstack/react-query";
import { featureApi } from "./api";

export const useGetAll = (params?: any) => {
  return useQuery({
    queryKey: ["resource-list", params],
    queryFn: () => featureApi.getAll(params),
  });
};

export const useGetOne = (id: string) => {
  return useQuery({
    queryKey: ["resource-detail", id],
    queryFn: () => featureApi.getOne(id),
    enabled: !!id,
  });
};
```

**Cách dùng:**

```tsx
const { data, isLoading, isError, refetch } = useGetAll();
const { data, isLoading } = useGetOne("123");
```

**Các giá trị trả về:**
| Giá trị | Ý nghĩa |
|---------|---------|
| `data` | Response từ API |
| `isLoading` | Đang fetch lần đầu (chưa có cache) |
| `isFetching` | Đang fetch (có thể có cache rồi) |
| `isError` | Có lỗi xảy ra |
| `error` | Object lỗi chi tiết |
| `refetch()` | Gọi lại query thủ công |

---

## Mutations (`mutations.ts`)

Dùng cho các thao tác **ghi / cập nhật / xoá dữ liệu**. Sau khi thành công, gọi `invalidateQueries` để refetch data mới.

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { featureApi } from "./api";

export const useCreate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => featureApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resource-list"] });
    },
  });
};

export const useUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      featureApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resource-list"] });
    },
  });
};

export const useDelete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => featureApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resource-list"] });
    },
  });
};
```

**Cách dùng:**

```tsx
// mutate — chạy bất đồng bộ
const createMutation = useCreate();
createMutation.mutate({ name: "Mới" });

// mutateAsync — dùng async/await
const handleSubmit = async (data: any) => {
  try {
    await createMutation.mutateAsync(data);
    toast.success("Thành công!");
  } catch (err) {
    toast.error("Có lỗi xảy ra");
  }
};
```

**Các giá trị trả về:**
| Giá trị | Ý nghĩa |
|---------|---------|
| `mutate()` | Chạy mutation |
| `mutateAsync()` | Chạy mutation, trả Promise |
| `isPending` | Đang xử lý |
| `isError` | Có lỗi |
| `error` | Object lỗi |
| `isSuccess` | Thành công |
| `data` | Response từ API |

---

## Thêm feature mới

**Bước 1:** Tạo thư mục và các file

```
src/services/products/
├── api.ts
├── queries.ts
└── mutations.ts
```

**Bước 2:** Viết api, queries, mutations theo pattern trên

**Bước 3:** Export trong `src/services/index.ts`

```typescript
export * from './news/queries';
export * from './news/mutations';
export * from './products/queries';
export * from './products/mutations';
```

**Bước 4:** Import vào component

```tsx
import { useGetAll, useCreate } from "@/src/services";
```

---

## Env variables

Đặt trong `.env.local`:

```bash
NEXT_PUBLIC_API_URL=https://api.example.com
```

---

## QueryProvider

Đã được cấu hình trong `src/providers/query-provider.tsx` và wrap ở `app/[locale]/layout.tsx`.

**Default options:**

| Option | Giá trị | Ý nghĩa |
|--------|---------|---------|
| `staleTime` | 5 phút | Thời gian trước khi data được coi là cũ |
| `gcTime` | 10 phút | Thời gian giữ cache khi không dùng |
| `retry` | 1 | Số lần retry khi request thất bại |
| `refetchOnWindowFocus` | false | Không refetch khi quay lại tab |

---

## Ví dụ hoàn chỉnh

```tsx
"use client";

import { useState } from "react";
import { useGetAll, useCreate, useDelete } from "@/src/services";

export default function ProductList() {
  const { data, isLoading } = useGetAll();
  const createMutation = useCreate();
  const deleteMutation = useDelete();

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <ul>
      {data?.map((item: any) => (
        <li key={item.id}>
          {item.name}
          <button onClick={() => handleDelete(item.id)}>Xoá</button>
        </li>
      ))}
    </ul>
  );
}
```
