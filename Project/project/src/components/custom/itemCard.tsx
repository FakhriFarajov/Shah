import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Heart } from "lucide-react";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { productCardDTO } from "@/features/profile/DTOs/profile.interfaces";
import { apiCallWithManualRefresh } from "@/shared/apiWithManualRefresh";
import { addToCart, addToFavourites, removeFromCart, removeFromFavourites, getProductDetailsById } from "@/features/profile/product/profile.service";
import { toast } from "sonner";
import { useEffect, useState } from "react";


export default function ProductCard({ product }: { product: productCardDTO }) {
  const navigator = useNavigate();

  const [isFavorite, setIsFavorite] = useState<boolean>(product.isFavorite || false);
  const [isInCart, setIsInCart] = useState<boolean>(product.isInCart || false);
  const [variantStock, setVariantStock] = useState<number | null>(null);
  // Fetch product details to determine stock for the representative variant
  useEffect(() => {
    let cancelled = false;
    async function loadDetails() {
      try {
        const res = await apiCallWithManualRefresh(() => getProductDetailsById(product.id));
        const details: any = (res as any)?.data ?? res;
        // Try to find the representative variant and take a stock-like field
        const variants: any[] = Array.isArray(details?.variants) ? details.variants : [];
        const variant = variants.find(v => v.id === product.representativeVariantId || v.productVariantId === product.representativeVariantId) || variants[0];
        const stockLike = variant?.availableQuantity ?? variant?.stock ?? variant?.quantity ?? details?.availableQuantity ?? details?.stock ?? null;
        if (!cancelled) setVariantStock(typeof stockLike === 'number' ? stockLike : null);
      } catch (e) {
        // Silent fail; keep fallback behavior
        if (!cancelled) setVariantStock(null);
      }
    }
    loadDetails();
    return () => { cancelled = true; };
  }, [product.id, product.representativeVariantId]);

  // Consider multiple possible inventory fields from backend with details override
  const derivedOutOfStockFromCard =
    (product as any)?.stock === 0 ||
    (product as any)?.availableQuantity === 0 ||
    (product as any)?.inStock === false;
  const outOfStock: boolean = (variantStock !== null) ? variantStock <= 0 : derivedOutOfStockFromCard;


  const handleFavAdd = async () => {
    console.log("Toggling favourite for product:", product);
    const data = {
      productId: product.representativeVariantId,
    };
    try {
      const result = await apiCallWithManualRefresh(() => addToFavourites(data.productId));
      console.log("Favourites updated:", result);
      toast.success("Favourites updated");
      setIsFavorite(true);
    }
    catch (error: any) {
      console.error("Failed to update favourites:", error);
      // Network/axios specific handling
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        toast.error('Network error: could not reach server. Check your connection or backend.');
      } else if (error.response) {
        if(error.response.status === 401){
          toast.error(`Unauthorized: Please log in to manage favourites.`);
          navigator('/login');
        } else {
          toast.error('Failed to update favourites');
        }
      }
      return;
    }
  };

  const handleFavRemove = async () => {
    const data = {
      productId: product.representativeVariantId,
    };
    try {
      const result = await apiCallWithManualRefresh(() => removeFromFavourites(data.productId));
      console.log("Favourites updated:", result);
      setIsFavorite(false);
      toast.success("Favourites updated");
    }
    catch (error: any) {
      console.error("Failed to update favourites:", error);
      // Network/axios specific handling
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        toast.error('Network error: could not reach server. Check your connection or backend.');
      } else if (error.response) {
        toast.error(`Server error: ${error.response.status} ${error.response.statusText}`);
      } else {
        toast.error('Failed to update favourites');
      }
      return;
    }
  };

  const handleCartAdd = async () => {
    console.log("Adding to cart for product:", product);
    const data = {
      productId: product.representativeVariantId,
    };
    try {
      const result = await apiCallWithManualRefresh(() => addToCart(data.productId));
      console.log("Cart updated:", result);
      toast.success("Cart updated");
      setIsInCart(true);
    }
    catch (error: any) {
      console.error("Failed to update cart:", error);
      // Network/axios specific handling
      if (error.response.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        toast.error('Network error: could not reach server. Check your connection or backend.');
      } else if (error.response) {
        if(error.response.status === 401){
          toast.error(`Unauthorized: Please log in to manage cart.`);
          navigator('/login');
        } else {
          console.error("Failed to update cart:", error.response);
          toast.error(`Server error: ${error.response.status} ${error.response.statusText}`);
        }
      } else {
        toast.error('Failed to update favourites');
      }
      return;
    }
  };

  const handleCartRemove = async () => {
    const data = {
      productId: product.representativeVariantId,
    };
    try {
      const result = await apiCallWithManualRefresh(() => removeFromCart(data.productId));
      console.log("Cart updated:", result);
      setIsInCart(false);
      toast.success("Cart updated");
    }
    catch (error: any) {
      console.error("Failed to update cart:", error);
      // Network/axios specific handling
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        toast.error('Network error: could not reach server. Check your connection or backend.');
      } else if (error.response) {
        toast.error(`Server error: ${error.response.status} ${error.response.statusText}`);
      } else {
        toast.error('Failed to update favourites');
      }
      return;
    }
  };



  return (
    <Card
      className="w-full sm:max-w-sm md:max-w-xl p-0 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition relative cursor-pointer"
      onClick={() => {
        window.location.href = `/product?id=${product.id}&productVariantId=${product.representativeVariantId}`;
      }}
    >
      {/* Favourite Button */}
      <button
        onClick={isFavorite ? handleFavRemove : handleFavAdd}
        className="absolute top-3 right-3 z-10 p-2 rounded-full  hidden xl:block bg-white shadow hover:bg-gray-100"
        title={isFavorite ? "Remove from Favourites" : "Add to Favourites"}
      >
        <Heart
          size={18}
          className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-500"}
        />
      </button>

      {/* Product Image */}
      <CardHeader
        className="p-0"
        onClick={() =>
          navigator(`/product?id=${product.id}&productVariantId=${product.representativeVariantId}`)
        }
      >
        <div className="w-full aspect-square overflow-hidden rounded-t-xl bg-gray-200">
          <img
            src={product.mainImage}
            alt={product.productTitle}
            className="w-full h-full object-cover"
          />
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent
        className="space-y-2"
        onClick={() =>
          navigator(`/product?id=${product.id}&productVariantId=${product.representativeVariantId}`)
        }
      >
        <h3 className="text-base font-semibold text-gray-900">
          {product.productTitle}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2 min-h-[43px]">
          {product.description}
        </p>

        {/* Category */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Badge variant="secondary" className="bg-gray-200 text-gray-700">
            {product.categoryName}
          </Badge>
        </div>

        {/* Price + Stock */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-lg font-bold text-gray-900">
            {product.price}$
          </span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < Math.round(product.averageRating) ? "text-yellow-400" : "text-gray-300"}
              fill={i < Math.round(product.averageRating) ? "currentColor" : "none"}
            />
          ))}
          <span className="text-xs text-gray-500 ml-2">
            ({product.reviewsCount})
          </span>
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="p-4 flex gap-2 items-center border-t border-gray-200">
        {outOfStock ? (
          <div className="flex-1 px-3 py-2 rounded-xl flex justify-center text-sm font-medium bg-gray-200 text-gray-600">
            Out of stock
          </div>
        ) : (
          <Button
            onClick={() => {
              isInCart ? handleCartRemove() : handleCartAdd();
            }}
            className={`flex-1 px-3 py-2 rounded-xl flex justify-center text-sm font-medium text-white ${isInCart ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            title={isInCart ? "Go to Cart" : "Add to Cart"}
          >
            {isInCart ? (
              <div className="flex items-center">
                <ShoppingCart size={16} className="mr-1" />
                Already in Cart
              </div>
            ) : (
              <>
                <ShoppingCart size={16} className="mr-1" />
                Add to Cart
              </>
            )}
          </Button>
        )}
        <Button
          onClick={isFavorite ? handleFavRemove : handleFavAdd}
          className="px-3 py-2 rounded-xl flex items-center text-sm font-medium bg-gray-100 hover:bg-gray-300 w-12 xl:w-12 flex xl:hidden"
          title={isFavorite ? "Remove from Favourites" : "Add to Favourites"}
        >
          <Heart
            size={16}
            className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-500"}
          />
        </Button>
      </CardFooter>
    </Card>
  );
}
