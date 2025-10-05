import Navbar from "../components/custom/Navbar/navbar";
import Footer from "../components/custom/footer";
import { AppSidebar } from "@/components/custom/sidebar";
import { Bar } from "react-chartjs-2";
import ImageZoom from "@/components/ui/image-zoom";
import { useState } from "react";
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

export default function ProductStatisticsPage() {// We must accept the id of the product via route params and fetch real data based on that id

  const [zoomImg, setZoomImg] = useState<string | null>(null);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex">
        <AppSidebar />
        <div className="flex-1 py-8 px-2 md:px-8">
          <div className="max-w-4xl mx-auto mt-8 mb-8 p-8 bg-white rounded-2xl shadow-xl border flex flex-col gap-8">
            {/* Product Images Gallery at Top */}
            <div className="w-full flex flex-col items-center mb-6">
              <div className="flex gap-4 overflow-x-auto w-full justify-center pb-2">
                {demoProduct.images.map((img, idx) => (
                  <div key={idx} className="relative group flex flex-col items-center">
                    <img
                      src={img}
                      alt={demoProduct.title + " " + (idx + 1)}
                      className="w-40 h-40 object-cover rounded-2xl border shadow flex-shrink-0"
                    />
                    <button
                      className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700 text-xs"
                      onClick={() => setZoomImg(img)}
                    >
                      Zoom
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <span className="bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full">
                  {demoProduct.category}
                </span>
                <span className="text-gray-400 text-xs mt-1">
                  {demoProduct.subcategory}
                </span>
              </div>
            </div>
            {/* Zoom Modal Overlay */}
            {zoomImg && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
                <div className="bg-white rounded-2xl p-4 shadow-xl flex flex-col items-center relative">
                  <ImageZoom
                    src={zoomImg}
                    alt="Zoomed"
                    className="max-w-[80vw] max-h-[80vh] rounded-2xl border"
                  />
                  <button
                    className="absolute top-2 right-2 text-gray-600 bg-gray-100 rounded-full p-2 hover:bg-gray-200"
                    onClick={() => setZoomImg(null)}
                    aria-label="Close zoom"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
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
              <p className="text-gray-600 mb-2">{demoProduct.description}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="bg-gray-100 px-3 py-1 rounded">Price: <b>${demoProduct.price}</b></span>
                <span className="bg-gray-100 px-3 py-1 rounded">Stock: <b>{demoProduct.stock}</b></span>
                <span className="bg-gray-100 px-3 py-1 rounded">Weight: <b>{demoProduct.weight}kg</b></span>
                <span className="bg-gray-100 px-3 py-1 rounded">Size: <b>{demoProduct.height}x{demoProduct.width}x{demoProduct.depth}cm</b></span>
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
                <div className="flex flex-col gap-2">
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
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
