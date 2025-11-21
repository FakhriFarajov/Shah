import Navbar from "../components/custom/Navbar/navbar";
import Footer from "../components/custom/footer";
import { AppSidebar } from "@/components/custom/sidebar";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useEffect, useState } from "react";
import { apiCallWithManualRefresh } from "@/shared/apiWithManualRefresh";
import { getProductStatistics } from "@/features/profile/Product/Product.service";
import { useSearchParams } from "react-router-dom";
import { getImage } from "@/shared/utils/imagePost";
import Spinner from "@/components/custom/spinner";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ProductDetailsPage() {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("productId") || "";
  const productVariantId = searchParams.get("productVariantId") || "";
  const [details, setDetails] = useState<any | null>(null);
  const navigator = useNavigate();

  useEffect(() => {
    async function fetchDetails() {
      setLoading(true);
      try {
        var result = await apiCallWithManualRefresh(() => getProductStatistics(productId, productVariantId));
        // Resolve review image URLs asynchronously
        if (result.data?.reviews?.latest) {
          result.data.reviews.latest = await Promise.all(
            result.data.reviews.latest.map(async (review: any) => {
              const resolvedImages = Array.isArray(review.images)
                ? await Promise.all(
                  review.images.map(async (img: string) => {
                    try {
                      const url = await getImage(img);
                      return url || img;
                    } catch {
                      return img;
                    }
                  })
                )
                : [];
              return { ...review, images: resolvedImages };
            })
          );
        }
        setLoading(false);
        setDetails(result.data);
      } catch (error) {
        if(error?.response?.status === 401) {
          toast.info("You have to login in order to see product details.");
          navigator("/login");
        }
      }
    }
    fetchDetails();
  }, []);

  if (loading || !details) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-100 flex items-center justify-center z-50">
        <Spinner />
      </div>
    );
  }

  // Prepare chart data for orders and revenue
  const chartLabels = ["Last 1 Day", "Last 30 Days", "Last 1 Year"];
  const ordersData = [details.last1Day.orders, details.last30Days.orders, details.last1Year.orders];
  const revenueData = [details.last1Day.revenue, details.last30Days.revenue, details.last1Year.revenue];

  const ordersChart = {
    labels: chartLabels,
    datasets: [
      {
        label: "Orders",
        data: ordersData,
        backgroundColor: "#6366f1",
        borderRadius: 8,
      },
    ],
  };
  const revenueChart = {
    labels: chartLabels,
    datasets: [
      {
        label: "Revenue",
        data: revenueData,
        backgroundColor: "#10b981",
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

  return (
    <>
      {
        loading && (
          <div className="fixed inset-0 bg-white bg-opacity-100 flex items-center justify-center z-50">
            <Spinner />
          </div>
        )
      }
      <Navbar />
      <div className="min-h-screen flex flex-col md:flex-row">
        <AppSidebar />
        <div className="flex-1 py-8 px-2 md:px-8">
          <div className="max-w-4xl mx-auto mb-8">
            <div className="mb-4">
              <Button onClick={() => navigator(-1)} className="bg-indigo-500 text-white">&larr; Back</Button>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Product Details</h1>
            <p className="text-lg text-gray-500 mb-4">Product ID: {details.productId}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start">
                <h2 className="text-xl font-bold mb-2 text-indigo-700">Totals</h2>
                <div>Orders: {details.totals.orders}</div>
                <div>Items: {details.totals.items}</div>
                <div>Delivered Items: {details.totals.deliveredItems}</div>
                <div>Cancelled Items: {details.totals.cancelledItems}</div>
                <div>Revenue: ${details.totals.revenue}</div>
              </div>
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start">
                <h2 className="text-xl font-bold mb-2 text-indigo-700">Inventory</h2>
                <div>Stock Available: {details.inventory.stockAvailable}</div>
                <div>Min Price: ${details.inventory.minPrice}</div>
                <div>Max Price: ${details.inventory.maxPrice}</div>
                <div>Favorites: {details.favorites}</div>
              </div>
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start">
                <h2 className="text-xl font-bold mb-2 text-indigo-700">Ratings</h2>
                <div>Average: {details.ratings.average}</div>
                <div>Count: {details.ratings.count}</div>
              </div>
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start">
                <h2 className="text-xl font-bold mb-2 text-indigo-700">Top Variant</h2>
                {details.topVariants.map((v: any) => (
                  <div key={v.productVariantId}>
                    <div>Title: {v.title}</div>
                    <div>Quantity: {v.quantity}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                <h2 className="text-lg font-bold mb-4 text-indigo-700">Orders (Last 1 Day, 30 Days, 1 Year)</h2>
                <Bar data={ordersChart} options={chartOptions} className="w-full" />
              </div>
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                <h2 className="text-lg font-bold mb-4 text-green-700">Revenue (Last 1 Day, 30 Days, 1 Year)</h2>
                <Bar data={revenueChart} options={chartOptions} className="w-full" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-lg font-bold mb-2 text-indigo-700">Last 1 Day</h2>
                <div>Orders: {details.last1Day.orders}</div>
                <div>Items: {details.last1Day.items}</div>
                <div>Delivered Items: {details.last1Day.deliveredItems}</div>
                <div>Revenue: ${details.last1Day.revenue}</div>
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-lg font-bold mb-2 text-indigo-700">Last 30 Days</h2>
                <div>Orders: {details.last30Days.orders}</div>
                <div>Items: {details.last30Days.items}</div>
                <div>Delivered Items: {details.last30Days.deliveredItems}</div>
                <div>Revenue: ${details.last30Days.revenue}</div>
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-lg font-bold mb-2 text-indigo-700">Last 1 Year</h2>
                <div>Orders: {details.last1Year.orders}</div>
                <div>Items: {details.last1Year.items}</div>
                <div>Delivered Items: {details.last1Year.deliveredItems}</div>
                <div>Revenue: ${details.last1Year.revenue}</div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          {details?.reviews?.latest && details.reviews.latest.length > 0 && (
            <div className="mt-10 overflow-x-auto max-w-4xl mx-auto mb-8 px-2">
              <h2 className="text-2xl font-bold mb-4 text-indigo-700">Latest Reviews</h2>
              <div className="flex gap-6 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
                {details.reviews.latest.map((review: any) => (
                  <div key={review.id} className="bg-white rounded-xl shadow p-6 flex flex-col gap-2 min-w-[300px]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-lg text-indigo-600">{review.productVariantTitle}</span>
                      <span className="text-yellow-500">{'★'.repeat(review.rating)}</span>
                    </div>
                    <div className="text-gray-700 mb-2">{review.comment}</div>
                    <div className="text-xs text-gray-400 mb-2">{new Date(review.createdAt).toLocaleString()}</div>
                    {/* Images resolver */}
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 flex-wrap mt-2">
                        {review.images.map((imgUrl: string, idx: number) => (
                          <img
                            key={idx}
                            src={imgUrl}
                            alt={`Review image ${idx + 1}`}
                            className="w-20 h-20 object-cover rounded-lg border"
                            onError={e => (e.currentTarget.src = '/vite.svg')}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
