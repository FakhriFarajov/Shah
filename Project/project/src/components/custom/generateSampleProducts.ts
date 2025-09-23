// Generates an array of sample products for the main page grid
import { sampleProduct } from "./sampleData";

export function generateSampleProducts(count = 16) {
  return Array.from({ length: count }, (_, i) => ({
    ...sampleProduct,
    id: (i + 1),
    title: `Product ${i + 1}`,
    price: (Math.random() * 100 + 10).toFixed(2),
    images: [
      { id: "1" + (i + 1), url: `https://picsum.photos/seed/product${i + 1}/400/400` },
      { id: "2" + (i + 1), url: `https://picsum.photos/seed/product${i + 1}-2/400/400` },
      { id: "3" + (i + 1), url: `https://picsum.photos/seed/product${i + 1}-4/400/400` },
    ],
    reviews: [
      { id: "1", rating: Math.floor(Math.random() * 2) + 4, comment: "Nice!", buyer: "User", createdAt: new Date().toISOString() },
      { id: "2", rating: Math.floor(Math.random() * 2) + 4, comment: "Good value.", buyer: "User", createdAt: new Date().toISOString() },
      { id: "2", rating: Math.floor(Math.random() * 2) + 4, comment: "Good value.", buyer: "User", createdAt: new Date().toISOString() },
      { id: "2", rating: Math.floor(Math.random() * 2) + 4, comment: "Good value.", buyer: "User", createdAt: new Date().toISOString() },
      { id: "2", rating: Math.floor(Math.random() * 2) + 4, comment: "Good value.", buyer: "User", createdAt: new Date().toISOString() },
      { id: "2", rating: Math.floor(Math.random() * 2) + 4, comment: "Good value.", buyer: "User", createdAt: new Date().toISOString() },
      { id: "2", rating: Math.floor(Math.random() * 2) + 4, comment: "Good value.", buyer: "User", createdAt: new Date().toISOString() },
      { id: "2", rating: Math.floor(Math.random() * 2) + 4, comment: "Good value.", buyer: "User", createdAt: new Date().toISOString() },
      { id: "2", rating: Math.floor(Math.random() * 2) + 4, comment: "Good value.", buyer: "User", createdAt: new Date().toISOString() },

    ],
  }));
}
