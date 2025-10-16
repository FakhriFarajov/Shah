import axios from "axios";
import { tokenStorage } from "@/shared/tokenStorage";


export async function uploadProfileImage(file: File): Promise<string> {
  const AUTH_API_KEY = import.meta.env.VITE_AUTH_API || "http://localhost:5298";
  const formData = new FormData();
  formData.append("file", file);
  const response = await axios.post(
    AUTH_API_KEY + "/api/Image/UploadImage",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        "Authorization": `Bearer ${tokenStorage.get()}`,
      },
    }
  );
  // If backend returns the objectName directly
  if (typeof response.data === "string") return response.data;
  // If backend returns { data: { objectName: string } }
  if (response.data?.data?.objectName) return response.data.data.objectName;
  throw new Error("Image upload response does not contain an objectName");
}


export async function getProfileImageUrl(objectName: string): Promise<string> {
  const AUTH_API_KEY = import.meta.env.VITE_AUTH_API || "http://localhost:5298";
  const response = await axios.get(
    `${AUTH_API_KEY}/api/Image/GetImage`,
    {
      params: { objectName },
      headers: { "Authorization": `Bearer ${tokenStorage.get()}` },
    }
  );
  // If backend returns the URL directly
  if (typeof response.data === "string") return response.data;
  // If backend returns { url: string }
  if (response.data?.url) return response.data.url;
  throw new Error("Image URL response does not contain a url");
}
