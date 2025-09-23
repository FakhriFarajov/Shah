import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { BsCart3 } from 'react-icons/bs';
import { addToCart } from '@/store/cartSlice';
import { useDispatch } from 'react-redux';
import Navbar from '@/components/custom/Navbar/navbar';
import Footer from '@/components/custom/footer';
import { useState, useRef } from 'react';
import React from 'react';
import { useTranslation } from "react-i18next";
import { toast } from 'sonner';
import { generateSampleProducts } from "@/components/custom/generateSampleProducts";
import ProductCard from '@/components/custom/itemCard';

export default function ProductPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const cartItems = useSelector((state: any) => state.cart);
  const { id } = useParams();



  const products = generateSampleProducts(20); //take random products for related products section

  let product = useSelector((state: any) =>
    state.product.find((p: any) => String(p.id) === String(id))
  );
  // If not found in Redux, try generated sample products (for demo/test)
  if (!product) {
    product = generateSampleProducts(20).find((p) => String(p.id) === String(id));
  }
  const isOutOfStock = product?.inStock <= 0;

  // Images array for gallery
  const images: string[] = Array.isArray(product?.images)
    ? product.images.map((img: any) => img.url)
    : [];


  // State for selected main image index
  const [mainImageIdx, setMainImageIdx] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  // Slide to selected image (train effect)
  const slideToImage = (idx: number) => {
    setMainImageIdx(idx);
  };

  const handleNextImage = () => {
    if (!images.length) return;
    setMainImageIdx((prev) => (images.length ? (prev + 1) % images.length : 0));
  };
  const handlePrevImage = () => {
    if (!images.length) return;
    setMainImageIdx((prev) => (images.length ? (prev - 1 + images.length) % images.length : 0));
  };

  // Group productPropertiesValues by property name
  const propertyMap: Record<string, string[]> = {};
  if (Array.isArray(product.productPropertiesValues)) {
    product.productPropertiesValues.forEach((ppv: any) => {
      const propName = ppv.categoryProperty?.name || 'Property';
      if (!propertyMap[propName]) propertyMap[propName] = [];
      if (!propertyMap[propName].includes(ppv.value)) propertyMap[propName].push(ppv.value);
    });
  }

  // State for selected value of each property
  const [selectedProperties, setSelectedProperties] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    Object.keys(propertyMap).forEach((prop) => {
      initial[prop] = propertyMap[prop][0];
    });
    return initial;
  });

  // Helper to check if all properties are selected
  const allPropertiesSelected = Object.keys(propertyMap).every(
    (prop) => selectedProperties[prop]
  );

  const isVariantInCart = cartItems.some((item: any) => {
    if (item.id !== product.id) return false;
    // Check all selected properties match
    return Object.keys(propertyMap).every(
      (prop) => item[prop] === selectedProperties[prop]
    );
  });

  const renderButtonLabel = () => {
    if (isOutOfStock) return t('Out of Stock');
    if (isVariantInCart) return t('Already in Cart');
    if (!allPropertiesSelected) return t('Select all options');
    return t('Add to Cart');
  };

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const isLoggedIn = !!localStorage.getItem("userToken") && user;
    if (!isLoggedIn) {
      toast.error(t('Please log in to add items to your cart'));
      return;
    }
    if (isOutOfStock || isVariantInCart || !allPropertiesSelected) return;
    const productWithSelection = {
      ...product,
      ...selectedProperties,
    };
    dispatch(addToCart(productWithSelection));
  };

  // Check if user is registered and has bought the item
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isLoggedIn = !!localStorage.getItem("userToken") && user;
  // Simulate purchase check: look for product.id in user.orders (array of product ids)
  const hasBought = isLoggedIn && Array.isArray(user?.orders) && user.orders.includes(product?.id);

  // State for comment input and rating
  const [commentText, setCommentText] = useState("");
  const [commentRating, setCommentRating] = useState(0);
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const maxCommentLength = 250;
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || commentText.length > maxCommentLength || commentRating < 1 || commentSubmitted) return;
    // Here you would dispatch an action or call an API to save the comment and rating
    toast.success(t('Comment submitted!'));
    setCommentText("");
    setCommentRating(0);
    setCommentSubmitted(true);
  };



  if (!product) {
    return <div className="p-8 text-center text-red-500">{t('Product not found')}</div>;
  }
  return (
    <>
      <Navbar />
      <div className="w-full mx-auto p-6 bg-white rounded-lg  mt-8 ">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="flex flex-col md:flex-row gap-4">
              {images.length > 0 && (
                <div className="flex md:flex-col gap-2 md:mr-4 mb-4 md:mb-0">
                  {images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className={`w-16 h-16 object-cover rounded border cursor-pointer select-none ${mainImageIdx === idx ? 'border-gray-800' : 'border-gray-200'}`}
                      style={{ width: 64, height: 64, minWidth: 64, minHeight: 64, maxWidth: 64, maxHeight: 64, resize: 'none', userSelect: 'none', pointerEvents: 'auto' }}
                      draggable={false}
                      onClick={() => setMainImageIdx(idx)}
                    />
                  ))}
                </div>
              )}
              {images.length > 0 ? (
                <div className="relative w-full flex items-center justify-center" style={{ maxWidth: 520 }}>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 rounded-full shadow p-2 z-10 hover:bg-gray-100"
                    aria-label="Previous image"
                  >
                    &#8592;
                  </button>
                  <div className="relative w-full h-[500px] flex items-center justify-center overflow-hidden" style={{ maxWidth: 520 }}>
                    <div
                      ref={trackRef}
                      className="flex transition-transform duration-300 ease-in-out"
                      style={{
                        width: `${images.length * 520}px`,
                        transform: `translateX(-${mainImageIdx * 520}px)`
                      }}
                    >
                      {images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Product ${idx + 1}`}
                          className="object-cover bg-gray-100"
                          style={{ width: 520, height: 500, flexShrink: 0, transition: 'box-shadow 0.2s', boxShadow: mainImageIdx === idx ? '0 0 0 4px #3b82f6' : 'none' }}
                        />
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 rounded-full shadow p-2 z-10 hover:bg-gray-100"
                    aria-label="Next image"
                  >
                    &#8594;
                  </button>
                </div>
              ) : (
                <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg">
                  {t('No Image')}
                </div>
              )}
            </div>

            {/* Reviews Section */}
            {Array.isArray(product.reviews) && product.reviews.length > 0 && (
              <div className="mt-8 bg-white rounded-lg shadow p-4 max-w-2xl w-full max-h-[400px] overflow-y-auto">
                <h2 className="text-lg font-semibold mb-2">{t('Reviews')}</h2>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-yellow-500 font-bold text-xl">
                    {(
                      product.reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / product.reviews.length
                    ).toFixed(1)}
                  </span>
                  <span className="text-gray-600">/ 5</span>
                  <span className="text-gray-500 ml-2">({product.reviews.length} {t('reviews')})</span>
                </div>
                <div className="space-y-4">
                  {product.reviews.map((review: any) => (
                    <div key={review.id} className="border-b pb-2">
                      <div className="flex items-center gap-2 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'} fill={i < review.rating ? 'currentColor' : 'none'} />
                        ))}
                        <span className="text-xs text-gray-500 ml-2">{review.rating} / 5</span>
                        {review.buyer && (
                          <span className="text-xs font-bold  ml-2">{t('by')} {review.buyer}</span>
                        )}
                        {
                          review.createdAt && (
                            <span className="text-xs text-gray-400 ml-2">on {new Date(review.createdAt).toLocaleDateString()}</span>
                          )
                        }
                      </div>
                      <div className="text-sm text-gray-800">{review.comment}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comment box for registered users who bought the item */}
            {hasBought && (
              <form onSubmit={handleCommentSubmit} className="mt-4 bg-white rounded-lg shadow p-4 max-w-2xl w-full">
                <h2 className="text-lg font-semibold mb-2">{t('Add your comment')}</h2>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-700">{t('Your rating')}:</span>
                  {[...Array(5)].map((_, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => !commentSubmitted && setCommentRating(i + 1)}
                      className="focus:outline-none"
                      aria-label={`Rate ${i + 1} star${i === 0 ? '' : 's'}`}
                      disabled={commentSubmitted}
                    >
                      <Star size={24} className={i < commentRating ? 'text-yellow-500' : 'text-gray-300'} fill={i < commentRating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={commentText}
                  onChange={e => {
                    if (!commentSubmitted && e.target.value.length <= maxCommentLength) setCommentText(e.target.value);
                  }}
                  className="w-full border rounded p-2 mb-2"
                  rows={3}
                  maxLength={maxCommentLength}
                  placeholder={t('Write your comment here...')}
                  disabled={commentSubmitted}
                />
                <div className="text-right text-xs text-gray-500 mb-2">{commentText.length}/{maxCommentLength} {t('characters')}</div>
                <Button type="submit" size="sm" className="w-full" disabled={commentText.length > maxCommentLength || commentRating < 1 || commentSubmitted}>{commentSubmitted ? t('Comment Submitted') : t('Submit Comment')}</Button>
              </form>
            )}
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">{t(product.title || product.name)}</h1>
              <div>

              </div>
              <h1>{t(product.seller.name)}</h1>
            </div>
            <p className="text-muted-foreground">{typeof product.category === 'object' ? t(product.category.name) : t(product.category)}</p>
            <div>
              <Badge>{t('Price')}: ${product.price}</Badge>
              {product.oldPrice && (
                <Badge className="bg-red-600 line-through ml-2">{t('Old Price')}: ${product.oldPrice}</Badge>
              )}

            </div>
            <div>
              <span className="text-sm m-0 text-muted-foreground">{t('Description')}:</span>
              {product.description && (
                <p className="text-gray-700 text-sm">{t(product.description)}</p>
              )}
            </div>
            <div className="flex gap-1 items-center">
              <span className="text-sm text-muted-foreground">{t('Rating')}:</span>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20}
                  className={i < (Array.isArray(product.reviews) ? (product.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / product.reviews.length) : (product.rating || 0)) ? 'text-yellow-500' : 'text-gray-300'}
                  fill={i < (Array.isArray(product.reviews) ? (product.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / product.reviews.length) : (product.rating || 0)) ? 'currentColor' : 'none'} />
              ))}
              <span className="text-sm text-muted-foreground ml-2">
                ({Array.isArray(product.reviews) ? product.reviews.length : (product.reviews || product.rating || 0)})
              </span>
            </div>
            <div>
              {Object.keys(propertyMap).map((prop) => (
                <div className="flex flex-col mt-4" key={prop}>
                  <Label>{t(prop)}:</Label>
                  <select
                    value={selectedProperties[prop]}
                    onChange={e => setSelectedProperties((prev) => ({ ...prev, [prop]: e.target.value }))}
                    className="border rounded p-2"
                  >
                    {propertyMap[prop].map((option) => (
                      <option key={option} value={option}>
                        {t(option)}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  className="w-full"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isVariantInCart}
                >
                  <BsCart3 className="mr-2 w-4 h-4" />
                  {renderButtonLabel()}
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full mx-auto p-6 bg-white rounded-lg mt-8 flex justify-center">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
