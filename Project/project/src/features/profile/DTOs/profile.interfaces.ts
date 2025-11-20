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
export interface GetBuyerProfileByIdRequest {
  id: string;
}

export default interface EditBuyerProfileRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface EditBuyerProfileResponse {
  isSuccess: boolean;
  message?: string;
  error?: string;

}
export interface AddAddressDto {
  buyerId: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  countryId: number;
}

export interface EditAddressDto {
  id: string;
  buyerId: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  countryId: number;
}

export interface AddressResponseDTO {
  id: string;
  buyerId: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: number;
}

export interface BuyerProfileResponseDTO {
  id: string;
  imageProfile: string | null;
  addressId: string;
  userId: string;
  email: string;
  isEmailConfirmed: boolean;
  name: string;
  surname: string;
  phone: string;
  countryCitizenshipId: number | null;
  createdAt: string;
}

export interface EditBuyerRequestDTO {
  name?: string;
  surname?: string;
  email?: string;
  phone?: string;
  imageProfile?: string;
  countryCitizenshipId?: number;
}

export interface Country {
  id: number;
  name: string;
  code: string; // ISO country code for flag representation
}

export interface Category {
  id: string;
  categoryName: string;
  parentCategoryId?: string;
}

export interface productCardDTO {
  id: string;
  productTitle: string;
  representativeVariantId: string;
  price: number;
  discountPrice?: number;
  mainImage: string;
  categoryName: string;
  storeName: string;
  description: string;
  reviewsCount: number;
  averageRating: number;
  isFavorite?: boolean;
  isInCart: boolean;
  productVariantId?: string | null;
  buyerId: string | null;
}
  
// Front-end representation of the C# ProductFilterRequestDTO
export interface ProductFilterRequest {
  categoryId?: string | null;
  includeChildCategories?: boolean;
  page?: number;
  pageSize?: number;
  minPrice?: number | null;
  maxPrice?: number | null;
  valueIds?: string[];
  userId?: string | null;
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
