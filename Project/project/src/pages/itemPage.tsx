import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";

// Example product type (customize as needed)
interface ProductType {
  id: string;
  name: string;
  image: string;
  images: string[];
  price: number;
  oldPrice?: number;
  rating: number;
  reviewCount: number;
  description: string;
  colors?: string[];
  sizes?: string[];
  stock: number;
}

interface ItemPageProps {
  product: ProductType;
  onAddToCart: (product: ProductType, quantity: number, color?: string, size?: string) => void;
}

export default function ItemPage({ product, onAddToCart }: ItemPageProps) {
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "");
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "");
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    onAddToCart(product, quantity, selectedColor, selectedSize);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-8 bg-gray-50 min-h-screen">
      {/* Image Gallery */}
      <div className="flex flex-col gap-2 w-full max-w-md">
        <img src={product.image} alt={product.name} className="rounded-lg w-80 h-80 object-cover border" />
        <div className="flex gap-2 overflow-x-auto">
          {product.images?.map((img, i) => (
            <img key={i} src={img} alt="thumb" className="w-16 h-16 object-cover rounded border cursor-pointer" />
          ))}
        </div>
      </div>
      {/* Product Info */}
      <div className="flex-1 flex flex-col gap-4">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold text-orange-600">${product.price.toFixed(2)}</span>
          {product.oldPrice && (
            <span className="line-through text-gray-400">${product.oldPrice.toFixed(2)}</span>
          )}
          <Badge className="ml-2">{((1 - product.price / (product.oldPrice || product.price)) * 100).toFixed(0)}% OFF</Badge>
        </div>
        <div className="flex items-center gap-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={18} className={i < product.rating ? "text-yellow-500" : "text-gray-300"} fill={i < product.rating ? "currentColor" : "none"} />
          ))}
          <span className="text-sm text-gray-600">{product.rating} ({product.reviewCount} reviews)</span>
        </div>
        <p className="text-gray-700 mb-2">{product.description}</p>
        {/* Color Picker */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <Label>Color:</Label>
            {product.colors.map((color) => (
              <button
                key={color}
                className={`w-6 h-6 rounded-full border-2 ${selectedColor === color ? "border-orange-500" : "border-gray-300"}`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
              />
            ))}
            <span className="ml-2 text-sm">{selectedColor}</span>
          </div>
        )}
        {/* Size Picker */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <Label>Size:</Label>
            <select
              className="border rounded p-1"
              value={selectedSize}
              onChange={e => setSelectedSize(e.target.value)}
            >
              {product.sizes.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        )}
        {/* Quantity Selector */}
        <div className="flex items-center gap-2 mb-2">
          <Label>Qty:</Label>
          <Button size="sm" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}>−</Button>
          <span>{quantity}</span>
          <Button size="sm" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} disabled={quantity >= product.stock}>+</Button>
          <span className="text-xs text-gray-500 ml-2">{product.stock} in stock</span>
        </div>
        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg mt-2"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
}
