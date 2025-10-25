import axios from "axios";
import { tokenStorage } from "@/shared/tokenStorage";

export async function getCategories(): Promise<any[]> {
  const VITE_FEATURES_API = import.meta.env.VITE_FEATURES_API || "http://localhost:5298";
  const response = await axios.get(
    VITE_FEATURES_API + "/api/Category/all",
    {
      headers: {
        "Authorization": `Bearer ${tokenStorage.get()}`,
      },
    }
  );
  if (Array.isArray(response.data)) return response.data;
  throw new Error("Categories response does not contain an array");
}
