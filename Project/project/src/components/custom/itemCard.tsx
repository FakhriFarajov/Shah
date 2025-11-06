import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addFavourite, removeFavourite } from "@/store/favouritesSlice";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";


export default function ProductCard({ product }: { product: any }) {
  const dispatch = useDispatch();
  const favourites = useSelector((state: any) => state.favourites || []);
  const [isFav, setIsFav] = useState(false);
  const navigator = useNavigate();

  // Sync with Redux favourites
  useEffect(() => {
    setIsFav(favourites.some((p: any) => p.id === product.id && p.size === product.size && p.color === product.color));
  }, [favourites, product.id, product.size, product.color]);

  const handleFavToggle = () => {
    const favData = {
      id: product.id,
      name: product.name,
      title: product.title,
      price: product.price,
      inStock: product.inStock,
      images: product.images || ["https://via.placeholder.com/300x200"],
      size: product.size,
      color: product.color,
      daysLeft: product.daysLeft,
      oldPrice: product.oldPrice,
      category: product.category,
      stock: product.stock,
      seller: product.seller,
      description: product.description,
      reviews: product.reviews || [],
    };
    if (isFav) {
      dispatch(removeFavourite({ id: favData.id, size: favData.size, color: favData.color }));
    } else {
      dispatch(addFavourite(favData));
    }
  };

  // Sync Redux favourites to localStorage for persistence
  useEffect(() => {
    localStorage.setItem("favourites", JSON.stringify(favourites));
  }, [favourites]);

  const avgRating =
    product.reviews?.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
        product.reviews.length
      : 0;

  return (
    <Card className="w-full max-w-sm p-0 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition relative">
      {/* Favourite Button */}
      <button
        onClick={handleFavToggle}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white shadow hover:bg-gray-100"
        title={isFav ? "Remove from Favourites" : "Add to Favourites"}
      >
        <Heart
          size={18}
          className={isFav ? "fill-red-500 text-red-500" : "text-gray-500"}
        />
      </button>

      {/* Product Image */}
      <CardHeader className="p-0" onClick={() => navigator(`/product/${product.id}`)}>
        <div className="w-full aspect-square overflow-hidden rounded-t-xl bg-gray-200">
          <img
            src={product.images[0]?.url || "https://via.placeholder.com/300x200"}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="space-y-2" onClick={() => navigator(`/product/${product.id}`)}>
        <h3 className="text-base font-semibold text-gray-900">
          {product.title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2">
          {product.description}
        </p>

        {/* Category */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Badge variant="secondary" className="bg-gray-200 text-gray-700">
            {product.category.name}
          </Badge>
        </div>

        {/* Price + Stock */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-lg font-bold text-gray-900">
            ${product.price}
          </span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < avgRating ? "text-yellow-500" : "text-gray-300"}
              fill={i < avgRating ? "currentColor" : "none"}
            />
          ))}
          <span className="text-xs text-gray-500 ml-2">
            ({product.reviews.length})
          </span>
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="p-4 flex justify-between items-center border-t border-gray-200">
        <span className="text-xs text-gray-500">{product.seller.name}</span>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              const cart = JSON.parse(localStorage.getItem("cart") || "[]");
              if (!cart.some((p: any) => p.id === product.id)) {
                localStorage.setItem("cart", JSON.stringify([...cart, { ...product, quantity: 1 }]));
              }
            }}
            className="px-3 py-1 rounded-xl text-xs font-medium "
          >
            <ShoppingCart size={16} className="mr-1" />
            Add to Cart
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
