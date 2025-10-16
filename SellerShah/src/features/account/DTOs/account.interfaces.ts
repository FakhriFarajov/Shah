export interface RegisterRequest {
  Name: string;
  Surname: string;
  Email: string;
  Phone: string;
  Passport: string;
  CountryCitizenship: number; // Use enum value
  Password: string;
  ConfirmPassword: string;
  StoreLogoUrl: string;
  StoreName: string;
  StoreDescription: string;
  StoreContactPhone: string;
  StoreContactEmail: string;
  TaxIdType: number; // Use enum value
  TaxIdNumber: string;
  Street: string;
  City: string;
  State: string;
  PostalCode: string;
  StoreCountryCode: number; // Use enum value
  CategoryId?: string | null;
}
export interface RegisterResponse {
  isSuccess: boolean;
  error?: string;
}
// List of countries with ids
export interface Country {
  id: number;
  name: string;
}

export interface ForgetPasswordRequest {
  userId: string;
  oldPassword: string;
  newPassword: string;
}
export interface Tax {
  id: number;
  name: string;
}
