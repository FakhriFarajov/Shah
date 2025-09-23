export const sampleProduct = {
  id: "1",
  title: "Nike Air Max 2025",
  description: "Latest Nike Air Max shoes with premium test Nike Air Max shoes with premium cushitest Nike Air Max shoes with premium cushitest Nike Air Max shoes with premium cushitest Nike Air Max shoes with premium cushitest Nike Air Max shoes with premium cushitest Nike Air Max shoes with premium cushitest Nike Air Max shoes with premium cushitest Nike Air Max shoes with premium cushitest Nike Air Max shoes with premium cushitest Nike Air Max shoes with premium cushitest Nike Air Max shoes with premium cushitest Nike Air Max shoes with premium cushitest Nike Air Max shoes with premium cushitest Nike Air Max shoes with premium cushicushioning.",
  price: 199.99,
  inStock: 25,
  categoryId: "c1",
  category: {
    id: "1",
    name: "Shoes",
  },
  sellerId: "1",
  seller: {
    id: "1",
    name: "Nike Official Store",
  },
  images: [
    { id: "1", url: "https://picsum.photos/seed/product$1-$1/400/400" },
    { id: "2", url: "https://picsum.photos/seed/product$2-$2/400/400" },
  ],
  reviews: [
    { id: "1", rating: 5, comment: "Great quality!", buyer: "John Doe"  },
    { id: "2", rating: 4, comment: "Very comfortable.", buyer: "Jane Smith"  },
  ],
  productPropertiesValues: [
    {
      id: "1",
      value: "Red",
      categoryProperty: { id: "1", name: "Color", categoryId: "1" },
    },
    {
      id: "1",
      value: "Yellow",
      categoryProperty: { id: "1", name: "Color", categoryId: "1" },
    },
    {
      id: "1",
      value: "Blue",
      categoryProperty: { id: "1", name: "Color", categoryId: "1" },
    },
    {
      id: "1",
      value: "42",
      categoryProperty: { id: "1", name: "Size", categoryId: "1" },
    },

  ],
}
