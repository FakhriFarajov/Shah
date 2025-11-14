import Navbar from "../components/custom/Navbar/navbar";
import Footer from "../components/custom/footer";
import { AppSidebar } from "@/components/custom/sidebar";
import { Bar } from "react-chartjs-2";
import { Button } from "@/components/ui/button";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";




ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Demo product data
const demoProduct = {
  id: "p1",
  title: "Sample Product",
  description: "This is a sample product description.",
  price: 99.99,
  stock: 50,
  weight: 1.5,
  height: 10,
  width: 5,
  depth: 2,
  category: "Electronics",
  subcategory: "Phones",
  images: [
    "https://via.placeholder.com/150",
    "https://via.placeholder.com/150/6366f1/fff?text=Image+2",
    "https://via.placeholder.com/150/10b981/fff?text=Image+3"
  ],
  isVerified: true,
  reviews: [
    { id: "r1", rating: 4, comment: "Great product!" },
    { id: "r2", rating: 5, comment: "Excellent!" },
    { id: "r3", rating: 3, comment: "Good, but could be better." },
  ],
  variants: [
    {
      id: "v1",
      price: 89.99,
      stock: 20,
      weight: 1.2,
      attributeValues: [
        { attributeValueId: "color-red" },
        { attributeValueId: "storage-64gb" },
      ],
      images: [
        "https://via.placeholder.com/150/ff0000/fff?text=Red",
        "https://via.placeholder.com/150/00ff00/fff?text=Green",
      ],
    },
    {
      id: "v2",
      price: 99.99,
      stock: 30,
      weight: 1.5,
      attributeValues: [
        { attributeValueId: "color-blue" },
        { attributeValueId: "storage-128gb" },
      ],
      images: [
        "https://via.placeholder.com/150/0000ff/fff?text=Blue",
        "https://via.placeholder.com/150/ffff00/fff?text=Yellow",
      ],
    },
  ],
};

const salesData = {
  labels: ["2020", "2021", "2022", "2023", "2024", "2025"],
  datasets: [
    {
      label: "Sales",
      data: [120, 180, 150, 210, 300, 250],
      backgroundColor: "#6366f1",
      borderRadius: 8,
    },
  ],
};
const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: false },
  },
  scales: {
    y: { beginAtZero: true, grid: { color: "#f3f4f6" } },
    x: { grid: { color: "#f3f4f6" } },
  },
};

export default function ProductDetailsPage() {// We must accept the id of the product via route params and fetch real data based on that id


  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex">
        <AppSidebar />
        <div className="flex-1 py-8 px-2 md:px-8">
          <div className="max-w-4xl mx-auto mt-8 mb-8 p-8 bg-white rounded-2xl shadow-xl border flex flex-col gap-8">
            <div className=" flex justify-start items-left">
              <Button
                type="button"
                variant="outline"
                className="mb-4 ml-0 mr-auto"
                onClick={() => window.history.back()}
              >
                ← Back
              </Button>
            </div>
            {/* Product Images */}
            {/* Product Info & Stats */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-800">{demoProduct.title}</h2>
                {demoProduct.isVerified ? (
                  <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">Verified</span>
                ) : (
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">Unverified</span>
                )}
              </div>
              <div className="flex gap-2 mt-2">
                {/* {categories.map(cat => (
                  <span key={cat.id} className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs">
                    {cat.name}
                  </span>
                ))} */}
              </div>
              <p className="text-gray-600 mb-2">{demoProduct.description}</p>
              <div className="flex flex-wrap gap-4 text-sm">
              </div>
              {/* Statistics */}
              <div className="flex flex-col md:flex-row gap-8 mt-6">
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-indigo-600">
                      {demoProduct.reviews.length > 0
                        ? (
                          demoProduct.reviews.reduce((acc, r) => acc + r.rating, 0) / demoProduct.reviews.length
                        ).toFixed(1)
                        : "-"}
                    </span>
                    <span className="text-yellow-400 text-xl">★</span>
                    <span className="text-gray-500">({demoProduct.reviews.length} reviews)</span>
                  </div>
                  <span className="text-gray-400 text-xs">Average Rating</span>
                  <div className="mt-2 text-lg font-semibold text-gray-700">Total Sales: 120</div>
                </div>
                <div className="flex-1 min-w-[250px]">
                  <Bar data={salesData} options={chartOptions} height={180} />
                </div>
              </div>
              {/* Recent Reviews */}
              <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-700 mb-2">Recent Reviews</h3>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2">
                  {demoProduct.reviews.length === 0 ? (
                    <span className="text-gray-400">No reviews yet.</span>
                  ) : (
                    demoProduct.reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="bg-gray-50 rounded p-3 border flex flex-col gap-1">
                        <span className="text-yellow-400">{"★".repeat(review.rating)}<span className="text-gray-300">{"★".repeat(5 - review.rating)}</span></span>
                        <span className="text-gray-700 text-sm">{review.comment}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
              {/* Variants Section */}
              {demoProduct.variants && demoProduct.variants.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-gray-700 mb-2">Variants</h3>
                  <div className="flex flex-col gap-4">
                    {demoProduct.variants.map((variant, idx) => (
                      <div key={variant.id || idx} className="bg-gray-50 rounded p-3 border flex flex-col gap-1">
                        <div className="flex gap-4 flex-wrap">
                          <span className="bg-gray-100 px-2 py-1 rounded">Price: <b>${variant.price}</b></span>
                          <span className="bg-gray-100 px-2 py-1 rounded">Stock: <b>{variant.stock}</b></span>
                          <span className="bg-gray-100 px-2 py-1 rounded">Weight: <b>{variant.weight}kg</b></span>
                          {/* Add more fields as needed */}
                        </div>
                        {/* Attributes */}
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {variant.attributeValues && variant.attributeValues.map((attr, i) => (
                            <span key={i} className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs">
                              {attr.attributeValueId}
                            </span>
                          ))}
                        </div>
                        {/* Images */}
                        <div className="flex gap-2 mt-2">
                          {variant.images && variant.images.map((img, i) => (
                            <img key={i} src={img} alt={`Variant ${idx + 1} Image`} className="w-12 h-12 object-cover rounded border" />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
