import { jwtDecode } from "jwt-decode";

export interface DecodedUser {
    id: string;
    name: string;
    surname: string;
    email: string;
    imageUrl?: string; 
}

export function decodeUserFromToken(token: string): DecodedUser | null {
    try {
        const decoded = jwtDecode(token) as DecodedUser;
        return decoded;
    } catch (error) {
        return null;
    }
}
