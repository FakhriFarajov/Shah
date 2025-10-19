export interface RegisterRequest {
    name: string;
    surname: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    countryCitizenshipId: number;
}
export interface RegisterResponse {
    isSuccess: boolean;
    message?: string;
    error?: string;
}

export default interface ForgetPasswordRequest {
    userId: string; 
    oldPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}
