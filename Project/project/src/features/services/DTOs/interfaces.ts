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

export interface Review {
  id: string;
  buyerProfileId?: string;
  buyerName?: string;
  productVariantId?: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt?: string;
  // enriched
  imageUrls?: string[];
}

export interface ReviewsSectionProps {
  editingReviewId?: string | null;
  setEditingReviewId?: (id: string | null) => void;
  editedReview?: { comment: string; rating: number };
  setEditedReview?: (review: { comment: string; rating: number }) => void;
  saveReview?: (id: string) => void;
  deleteReview?: (id: string) => void;
  buyer?: any;
}


export interface OrderResponse {
  isSuccess: boolean;
  message: string;
  statusCode: number;
  data: OrderData;
}

export interface OrderData {
  id: string;
  status: number;
  createdAt: string;
  updatedAt: string | null;
  totalAmount: number;
  receipt: Receipt;
  payment: Payment;
  items: OrderItem[];
}

export interface OrderSummary {
  id: string;
  status: number;
  createdAt: string;
  totalAmount: number;
  itemCount: number;
  paymentStatus: number;
  receiptId: string;
}

export interface Receipt {
  id: string;
  fileUrl: string;
  issuedAt: string;
}

export interface Payment {
  id: string;
  totalAmount: number;
  currency: string;
  method: number;
  status: number;
  gatewayTransactionId: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productVariantId: string;
  title: string;
  price: number;
  quantity: number;
  status: number;
  images: ProductImage[];
  lineTotal: number;
}

export interface ProductImage {
  id: string;
  imageUrl: string;
  isMain: boolean;
  productVariantId: string;
  productVariant: any | null;
}

export interface OrdersSectionProps {
  orderStatusFilter: string;
  setOrderStatusFilter: (val: string) => void;
  MdAccountCircle: React.ElementType;
}