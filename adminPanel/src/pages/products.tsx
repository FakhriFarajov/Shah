import Navbar from "../components/custom/Navbar/navbar";
import { AppSidebar } from "@/components/custom/sidebar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { apiCallWithManualRefresh } from "@/shared/apiWithManualRefresh";
import { GetAllPaginatedProductAsync } from "@/features/profile/Product/Product.service";
import { getProfileImage } from "@/shared/utils/imagePost";
import { getDetails } from "@/features/profile/Product/Product.service";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
interface Product {
  id: string;
  productTitle: string;
  mainImage: string | null;
  storeName: string;
  price: number;
  categoryName: string;
  categoryChain: string[];
  reviewsCount: number;
}


export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const storeId = searchParams.get("storeInfoId");
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(1);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [productsToSearchId, setProductsToSearchId] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchProducts = async (newPage: number = page) => {
    setLoading(true);
    try {
      let result;
      if (storeId && storeId !== "null" && storeId !== "") {
        result = await apiCallWithManualRefresh(() => GetAllPaginatedProductAsync(storeId, newPage, pageSize));
      } else {
        result = await apiCallWithManualRefresh(() => GetAllPaginatedProductAsync(null, newPage, pageSize));
      }

      const apiItems = Array.isArray(result?.data) ? result.data : [];

      // Detect if items are already in UI Product shape or raw API shape
      const needsMapping = apiItems.length > 0 && !(apiItems[0] as any).productTitle;

      if (needsMapping) {
        const mapped: Product[] = apiItems.map((it: any): Product => {
          const price = typeof it.priceMax === 'number' ? it.priceMax : (it.priceMin ?? 0);

          // find main image from variants -> images
          let mainImageObjectName: string | null = null;
          if (Array.isArray(it.variants)) {
            for (const v of it.variants) {
              if (v?.images && v.images.length > 0) {
                const main = v.images.find((i: any) => i.isMain) || v.images[0];
                if (main?.imageUrl) {
                  mainImageObjectName = main.imageUrl;
                  break;
                }
              }
            }
          }

          const title = it.variants && it.variants[0] && it.variants[0].title ? it.variants[0].title : `${it.categoryName ?? ''} - ${it.storeName ?? ''}`.trim();

          return {
            id: it.id,
            productTitle: title || 'Product',
            mainImage: mainImageObjectName,
            storeName: it.storeName ?? '',
            price,
            categoryName: it.categoryName ?? '',
            categoryChain: it.categoryName ? [it.categoryName] : [],
            reviewsCount: Array.isArray(it.reviews) ? it.reviews.length : 0,
          };
        });

        const productsWithImages = await Promise.all(mapped.map(async (p: Product) => {
          if (p.mainImage) {
            try {
              const url = await getProfileImage(p.mainImage);
              return { ...p, mainImage: url };
            } catch (err) {
              return { ...p, mainImage: null };
            }
          }
          return p;
        }));
        setProducts(productsWithImages);
      } else {
        // Items already look like Product UI objects; still resolve images if needed
        const productsWithImages = await Promise.all(apiItems.map(async (product: any): Promise<Product> => {
          if (product.mainImage) {
            try {
              const url = await getProfileImage(product.mainImage);
              return { ...product, mainImage: url };
            } catch (err) {
              return product;
            }
          }
          return product;
        }));
        setProducts(productsWithImages);
      }

      setTotalItems(result ? (result.totalItems ?? result.totalCount ?? 0) : 0);
      setTotalPages(result ? (result.totalPages ?? 1) : 1);
      setPage(result ? (result.page ?? newPage) : newPage);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProducts();
  }, [page, pageSize]);

  async function handleSearch() {
    if (!productsToSearchId.trim()) {
      toast.error('Please enter a Product ID to search.');
      return;
    }
    setLoading(true);
    try {
      const result = await apiCallWithManualRefresh(() => getDetails(productsToSearchId));
      if (result.isSuccess) {
        navigate(`/productsEditOrAdd?productId=${productsToSearchId}`);
      }
    } catch (error) {
      toast.error('Failed to fetch products. Please check the ID and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex">
        <AppSidebar />
        <div className="flex-1 py-8 px-2 md:px-8">
          <div className="max-w-6xl mx-auto mb-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Products</h1>
            <p className="text-lg text-gray-500 mb-4">View and manage all products here.</p>
            <div className="mb-4 flex items-center gap-2 justify-between">
              <div className="flex-1">
                <label htmlFor="filterId" className="font-medium text-gray-700">Filter by Product ID:</label>
                <input
                  id="filterId"
                  type="text"
                  value={productsToSearchId}
                  className="border rounded px-3 py-2 w-32 m-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter ID"
                  onChange={e => setProductsToSearchId(e.target.value)}
                />
                <Button onClick={handleSearch} variant="outline">Search</Button>
              </div>
            </div>
          </div>
          <div className="max-w-6xl mx-auto mt-4">
            <div className="flex flex-col gap-6">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : products.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No products found.</div>
              ) : products.map(product => (
                <div key={product.id} className="chad-card bg-white rounded-2xl shadow-xl border border-gray-200 p-6 flex flex-col md:flex-row items-center gap-6 transition-transform hover:scale-[1.02] hover:shadow-2xl">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-400 to-blue-400 flex items-center justify-center shadow-lg mb-2 md:mb-0 overflow-hidden">
                    {product.mainImage ? (
                      <img
                        src={`${product.mainImage}`}
                        alt={product.productTitle}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-white">{product.productTitle[0]}</span>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4 w-full">
                    <div className="text-left md:w-1/3">
                      <div className="font-bold text-xl text-gray-900">{product.productTitle}</div>
                      <div className="text-gray-500 text-sm mt-1">ID: {product.id}</div>
                      <div className="text-gray-500 text-sm mt-1">Store: {product.storeName}</div>
                    </div>
                    <div className="flex flex-col gap-1 md:w-1/3">
                      <div className="flex items-center gap-2 text-gray-700"><span className="font-medium">Price:</span> <span>{product.price}$</span></div>
                      <div className="flex items-center gap-2 text-gray-700"><span className="font-medium">Category:</span> <span>{product.categoryName}</span></div>
                      <div className="flex items-center gap-2 text-gray-700"><span className="font-medium">Reviews:</span> <span>{product.reviewsCount}</span></div>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-3 md:mt-0 md:w-1/3 justify-end">
                      <button
                        className="px-4 py-2 rounded-lg bg-gradient-to-tr from-green-400 to-green-600 text-white font-semibold shadow hover:from-green-500 hover:to-green-700 transition"
                        onClick={() => navigate(`/product-details?productId=${product.id}`)}
                        title="Statistics"
                      >
                        Statistics
                      </button>
                      <button
                        className="px-4 py-2 rounded-lg bg-gradient-to-tr from-blue-400 to-blue-600 text-white font-semibold shadow hover:from-blue-500 hover:to-blue-700 transition"
                        onClick={() => navigate(`/productsEditOrAdd?productId=${product.id}`)}
                        title="Edit"
                      >
                        Edit
                      </button>
                      <button
                        className="px-4 py-2 rounded-lg bg-gradient-to-tr from-red-400 to-red-600 text-white font-semibold shadow hover:from-red-500 hover:to-red-700 transition"
                        onClick={() => alert(`Delete product #${product.id}`)}
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                className="px-4 py-2 rounded-xl bg-indigo-800 text-white hover:bg-indigo-300 disabled:opacity-50"
                onClick={() => {
                  if (page > 1) setPage(page - 1);
                }}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className="text-gray-700">Page {page} of {totalPages} ({totalItems} items)</span>
              <button
                className="px-4 py-2 rounded-xl bg-indigo-800 text-white hover:bg-indigo-300 disabled:opacity-50"
                onClick={() => {
                  if (page < totalPages) setPage(page + 1);
                }}
                disabled={page === totalPages || totalPages === 0}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}