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
  Name: string;
  Surname: string;
  Email: string;
  Phone: string;
  CountryCitizenshipId: number;
  StoreLogo?: string;
  StoreName: string;
  StoreDescription: string;
  StoreContactPhone: string;
  StoreContactEmail: string;
  TaxId: number;
  TaxNumber: string;
  Street: string;
  City: string;
  State: string;
  PostalCode: string;
  StoreCountryCodeId: number;
  CategoryId?: string;
}

export interface EditSellerRequestDTO {
  Name?: string;
  Surname?: string;
  Email?: string;
  Phone?: string;
  CountryCitizenshipId?: number;
  StoreLogo?: string;
  StoreName?: string;
  StoreDescription?: string;
  StoreContactPhone?: string;
  StoreContactEmail?: string;
  TaxId?: number;
  TaxNumber?: string;
  Street?: string;
  City?: string;
  State?: string;
  PostalCode?: string;
  StoreCountryCodeId?: number;
  CategoryId?: string;
}

export interface Country {
  id: number;
  name: string;
  code: string; // ISO country code for flag representation
}

export interface Tax {
  id: number;
  name: string;
  RegexPattern: string;
}

export interface Category {
  id: string;
  name: string;
  parentId?: number;
}
