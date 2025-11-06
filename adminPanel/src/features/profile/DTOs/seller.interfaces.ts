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

export interface SellerAddress {
  id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  countryId: number;
}


export interface Seller{
  id: string;
  userId: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  countryCitizenshipId: number;
  createdAt: string;
  storeInfoId: string;
  storeName: string;
  storeEmail: string;
  addressId: string;
  address: SellerAddress;
}

export interface PaginatedSellersResponse {
  isSuccess: boolean;
  message: string;
  statusCode: number;
  data: Seller[];
  totalPages: number;
  currentPage: number;
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
