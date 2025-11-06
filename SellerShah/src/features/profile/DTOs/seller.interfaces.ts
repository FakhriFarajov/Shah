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