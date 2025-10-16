import axios from "axios";
import { tokenStorage } from "../tokenStorage";

export async function uploadProfileImage(file: File): Promise<string> {
  var AUTH_API_KEY = import.meta.env.VITE_AUTH_API || "http://localhost:5298";
  const formData = new FormData();
  formData.append("file", file);
  const response = await axios.post(AUTH_API_KEY+"/api/Image/UploadImage", formData, {
    headers: { "Content-Type": "multipart/form-data",
      "Authorization": `Bearer ${tokenStorage.get()}`
    }
  });
  // Return the image URL from backend response
  return response.data.data.uri;
}
