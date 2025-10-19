export interface RegisterRequest {
  Name: string;
  Surname: string;
  Email: string;
  Phone: string;
  Passport: string;
  CountryCitizenshipId: number; // Use enum value
  Password: string;
  ConfirmPassword: string;
  StoreLogo: string;
  StoreName: string;
  StoreDescription: string;
  StoreContactPhone: string;
  StoreContactEmail: string;
  TaxId: number; // Use enum value
  TaxNumber: string;
  Street: string;
  City: string;
  State: string;
  PostalCode: string;
  StoreCountryCodeId: number; // Use enum value
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
  confirmPassword: string;
}
export interface Tax {
  id: number;
  name: string;
  RegexPattern: string;
}
