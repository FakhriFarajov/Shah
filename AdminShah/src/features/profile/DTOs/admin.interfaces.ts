// Warehouse order DTO
export interface WarehouseOrder {
    id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    buyerId: string;
    sellerId: string;
    itemsCount: number;
}

// Warehouse order item DTO
export interface WarehouseOrderItem {
    id: string;
    quantity: number;
    orderId: string;
    productVariantId: string;
    variantPrice: number;
    productId: string;
    title: string;
    imageUrl?: string;
    buyerId: string;
    sellerId: string;
}

// Typed result for single object responses
export interface TypedResult<T> {
    isSuccess: boolean;
    message: string;
    statusCode: number;
    data: T;
}
// Warehouse DTO
export interface Warehouse {
    id: string;
    addressId: string;
    address: Address;
    capacity: number;
    currentCapacity?: number;
}

export interface Order{
    id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    buyerId: string;
    sellerId: string;
    itemsCount: number;
}

export interface CreateWarehouseRequestDTO {
    addressId?: string;
    address: Address;
    capacity: number;
}

export interface UpdateWarehouseRequestDTO {
    addressId?: string;
    address: Address;
    capacity: number;
}
// Request DTO for editing an admin profile
export interface EditAdminRequestDTO {
    name: string | null;
    surname: string | null;
    email: string | null;
    phone: string | null;
    countryCitizenshipId: number | null;
}
// Admin profile DTO
export interface AdminProfileResponseDTO {
    id: string;
    userId: string;
    name: string;
    surname: string;
    email: string;
    phone: string;
    countryCitizenshipId: number;
    createdAt: string;
    addressId: string | null;
    address: Address | null;
}

export interface Address {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    countryId: number;
}

export interface PaginatedResult<T> {
    isSuccess: boolean;
    message: string;
    statusCode: number;
    data: T[];
    page: number;
    contentPerPage: number;
    totalItems: number;
    totalPages: number;
}
export interface AddAdminProfileRequestDTO {
    name: string;
    surname: string;
    email: string;
    phone: string;
    countryCitizenshipId: number;
    password: string;
    confirmPassword: string;
}

export interface Country {
    id: number;
    name: string;
    code: string;
}

export interface SyncAttributeValueItemDto {
    id?: string;
    value: string;
}

export interface SyncAttributeItemDto {
    id?: string;
    name: string;
    values: SyncAttributeValueItemDto[];
}

export interface SyncCategoryItemDto {
    id?: string;
    categoryName: string;
    parentCategoryId?: string;
    attributes: SyncAttributeItemDto[];
}