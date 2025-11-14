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