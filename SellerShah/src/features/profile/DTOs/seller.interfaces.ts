export interface DecodedToken {
  BuyerId: string;
  name?: string;
  surname?: string;
  email?: string;
  exp?: number;
  iss?: string;
  aud?: string;
  [key: string]: any;
}


export interface GetSellerProfileByIdRequest {
  id: string;
}

export default interface EditSellerProfileRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface EditSellerProfileResponse {
  isSuccess: boolean;
  message?: string;
  error?: string;
}

// SellerProfileResponseDTO matches backend C# DTO
export interface SellerProfileResponseDTO {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  emailConfirmed: boolean;
  countryCitizenshipId: number;
  storeLogo?: string;
  storeName: string;
  storeInfoId: string;
  storeDescription: string;
  storeContactPhone: string;
  storeContactEmail: string;
  taxId: number;
  taxNumber: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  storeCountryCodeId: number;
  categoryId?: string;
}

export interface EditSellerRequestDTO {
  name?: string;
  surname?: string;
  email?: string;
  phone?: string;
  countryCitizenshipId?: number;
  storeLogo?: string;
  storeName?: string;
  storeDescription?: string;
  storeContactPhone?: string;
  storeContactEmail?: string;
  taxId?: number;
  taxNumber?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  storeCountryCodeId?: number;
  categoryId?: string;
}

export interface Country {
  id: number;
  name: string;
  code: string; // ISO country code for flag representation
}


export interface Category {
  id: string;
  name: string;
  parentId?: number;
}


export interface Tax {
  id: number;
  name: string;
  RegexPattern: string;
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


export interface PaginatedResult<T> {
    isSuccess: boolean;
    message: string;
    statusCode: number;
    data: T[];
    page: number;
    contentPerPage: number;
    totalItems: number;
    totalPages: number;
}export interface Warehouse {
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

export interface Address {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    countryId: number;
}

export interface Product {
  id: string;
  productTitle: string;
  mainImage: string | null;
  storeName: string;
  price: number;
  discountPrice: number | null;
  categoryName: string;
  categoryChain: string[];
  reviewsCount: number;
}