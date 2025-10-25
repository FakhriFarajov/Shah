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
export interface GetAdminProfileByIdRequest {
  id: string;
}

export default interface EditAdminProfileRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface EditAdminProfileResponse {
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

export interface AdminProfileResponseDTO {
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

export interface EditAdminRequestDTO {
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
  id: number;
  categoryName: string;
  parentCategoryId?: string;
}

export interface Tax{
  id: number;
  taxName: string;
  taxRegex: string;
}
