import { useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Heart, MessageCircle, ShoppingCart, Star } from 'lucide-react';
import Navbar from '@/components/custom/Navbar/navbar';
import Footer from '@/components/custom/footer';
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { toast } from 'sonner';
import { apiCallWithManualRefresh } from '@/shared/apiWithManualRefresh';
import { addToCart, addToFavourites, getProductDetailsById, removeFromCart, removeFromFavourites, addReview, getReviewsByProductVariantId, editReview } from '@/features/profile/product/profile.service';
import { tokenStorage } from '@/shared/tokenStorage';
import { decodeUserFromToken } from '@/shared/utils/decodeToken';
import { getRandomPaginated } from '@/features/profile/product/profile.service';
import { jwtDecode } from 'jwt-decode';
import { uploadImage } from '@/shared/utils/imagePost';
import { getImage } from '@/shared/utils/imagePost';
import ProductCard from "@/components/custom/itemCard";
import { useNavigate } from 'react-router-dom';
import Spinner from '@/components/custom/Spinner';
import { ImageZoom } from '@/components/ui/shadcn-io/image-zoom';


export default function ProductPage() {
  useEffect(() => {
    if (!productId) return;
    const historyKey = 'productHistory';
    const variantId = productVariantIdParam || null;
    // Get existing history
    let history: Array<{ productId: string, variantId: string | null, timestamp: number }> = [];
    try {
      const raw = localStorage.getItem(historyKey);
      if (raw) history = JSON.parse(raw);
    } catch { }
    // Add new entry
    history.unshift({ productId, variantId, timestamp: Date.now() });
    // Remove duplicates (keep most recent)
    const seen = new Set();
    history = history.filter(item => {
      const key = item.productId + ':' + (item.variantId ?? '');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    // Limit history size
    history = history.slice(0, 50);
    localStorage.setItem(historyKey, JSON.stringify(history));
  }, []);

  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("id");
  const productVariantIdParam = searchParams.get("productVariantId");
  const [info, setInfo] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const navigator = useNavigate();

  useEffect(() => {
    const load = async () => {
      const tok: string | null = tokenStorage.get();
      const result = decodeUserFromToken(tok || '');
      setLoading(true);
      try {
        const fetched = await apiCallWithManualRefresh(() => getRandomPaginated(1, 16, result?.id ?? ''));
        const items = Array.isArray(fetched)
          ? fetched
          : Array.isArray(fetched?.data)
            ? fetched.data
            : Array.isArray(fetched?.data?.data)
              ? fetched.data.data
              : [];

        // Resolve images in parallel and attach `mainImageUrl` (or placeholder)
        if (Array.isArray(items) && items.length > 0) {
          await Promise.all(
            items.map(async (element: any) => {
              try {
                if (element.mainImage) {
                  const url = await getImage(element.mainImage);
                  element.mainImage = url || "https://via.placeholder.com/300x200";
                } else if (element.mainImage) {
                  element.mainImage = element.mainImage;
                } else {
                  element.mainImage = "https://via.placeholder.com/300x200";
                }
              } catch (error) {
                element.mainImage = "https://via.placeholder.com/300x200";
              }
            })
          );
        }
        setRelatedProducts(items);

      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    async function fetchProductDetails() {
      if (!productId) {
        toast.error(t('Product ID is missing in the URL'));
        return;
      }
      try {
        const res = await apiCallWithManualRefresh(() => getProductDetailsById(productId));
        const productData = res && res.data ? res.data : res;
        try {
          // Optionally fetch reviews separately if needed
        } catch (error) {
          toast.error("Failed to load product reviews");
        }
        // Resolve image identifiers to URLs for top-level images and variant images
        const resolveImages = async (pd: any) => {
          try {
            if (Array.isArray(pd.images)) {
              await Promise.all(
                pd.images.map(async (img: any, idx: number) => {
                  try {
                    const idOrUrl = img.imageUrl ?? img.url ?? img;
                    const url = await getImage(idOrUrl);
                    pd.images[idx].imageUrl = url || idOrUrl;
                  } catch (e) {
                  }
                })
              );
            }

            if (Array.isArray(pd.variants)) {
              await Promise.all(
                pd.variants.map(async (v: any) => {
                  if (Array.isArray(v.images)) {
                    await Promise.all(
                      v.images.map(async (img: any, i: number) => {
                        try {
                          const idOrUrl = img.imageUrl ?? img.url ?? img;
                          const url = await getImage(idOrUrl);
                          v.images[i].imageUrl = url || idOrUrl;
                        } catch (e) {
                        }
                      })
                    );
                  }
                })
              );
            }
          } catch (e) {
          }
        };
        await resolveImages(productData);
        setInfo(productData);
        setIsFavorite(productData.isFavorite || false);
        setIsInCart(productData.isInCart || false);
      } catch (error) {
        toast.error("Failed to load product details");
      }
    }
    fetchProductDetails();
  }, []);

  const productData = (info && (info as any).data) ? (info as any).data : (info ?? {});

  // Determine active variant from URL param (fallback to first variant)
  const activeVariant = Array.isArray(productData?.variants)
    ? (productData.variants.find((v: any) => String(v.productVariantId ?? v.id) === String(productVariantIdParam)) || productData.variants[0])
    : null;
  const activeStock = (activeVariant?.availableQuantity ?? activeVariant?.stock ?? activeVariant?.quantity ?? 0);
  const outOfStock = activeStock <= 0;
  // Prefer variant images if present, otherwise use product-level images
  const displayImages = Array.isArray(activeVariant?.images) && (activeVariant.images.length > 0)
    ? activeVariant.images
    : (Array.isArray(productData.images) ? productData.images : []);
  // Prefer variant price/oldPrice when available
  const displayDiscountPrice = (activeVariant && typeof activeVariant.discountPrice !== 'undefined') ? activeVariant.discountPrice : productData.discountPrice;
  const displayPrice = (activeVariant && typeof activeVariant.price !== 'undefined') ? activeVariant.price : productData.price;
  const displayOldPrice = (activeVariant && typeof activeVariant.oldPrice !== 'undefined') ? activeVariant.oldPrice : productData.oldPrice;
  const hasDiscount = typeof displayDiscountPrice === 'number' && displayDiscountPrice < displayPrice;
  const discountPercent = hasDiscount && displayPrice > 0 ? Math.round(100 * (displayPrice - displayDiscountPrice) / displayPrice) : 0;
  const showDiscount = hasDiscount && discountPercent > 0;
  const displayTitle = (activeVariant && typeof activeVariant.title !== 'undefined') ? activeVariant.title : productData.title;
  const displayDescriptionRaw = (activeVariant && typeof activeVariant.description !== 'undefined') ? activeVariant.description : productData.description;

  const [isFavorite, setIsFavorite] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(false);
  const [myReview, setMyReview] = useState<any | null>(null);
  // Review form state
  const [commentRating, setCommentRating] = useState<number>(0);
  const [commentText, setCommentText] = useState<string>("");
  const [commentSubmitted, setCommentSubmitted] = useState<boolean>(false);
  const maxCommentLength = 250;
  const MAX_IMAGES = 5;
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  // Edit-flow image state
  const [existingImageNames, setExistingImageNames] = useState<string[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState<boolean>(false);
  const [isEditingReview, setIsEditingReview] = useState<boolean>(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Get current buyer/profile id from JWT and helper to check ownership
  const getCurrentBuyerId = (): string | null => {
    try {
      const token = tokenStorage.get();
      if (!token) return null;
      const decoded: any = jwtDecode(token);
      return (
        decoded?.buyerProfileId ||
        decoded?.profileId ||
        decoded?.id ||
        decoded?.sub ||
        null
      );
    } catch {
      return null;
    }
  };

  const isReviewMine = (r: any, myId: string | null): boolean => {
    if (!r || !myId) return false;
    const ownerId = r.buyerProfileId || r.buyerId || r.userId || r?.buyer?.id || r?.buyerProfile?.id || null;
    return String(ownerId ?? '') === String(myId);
  };

  // Sync isFavorite/isInCart with the active variant when data or URL changes
  useEffect(() => {
    if (!productData) return;
    if (productVariantIdParam && Array.isArray(productData.variants)) {
      const v = productData.variants.find((vv: any) => String(vv.productVariantId ?? vv.id) === String(productVariantIdParam));
      setIsFavorite(!!(v?.isFavorite ?? v?.is_favorite ?? false));
      setIsInCart(!!(v?.isInCart ?? v?.is_in_cart ?? false));
    } else {
      setIsFavorite(!!(productData.isFavorite ?? productData.is_favorite ?? false));
      setIsInCart(!!(productData.isInCart ?? productData.is_in_cart ?? false));
    }
  }, [productVariantIdParam, Array.isArray(productData?.variants) ? productData.variants.length : 0, productData?.isFavorite, productData?.isInCart]);

  // Load reviews once variant id is available (prefer URL param if provided)
  useEffect(() => {
    const variantId = productVariantIdParam || productData?.productVariantId;
    if (!variantId) return;
    let cancelled = false;
    const load = async () => {
      try {
        setLoadingReviews(true);
        const res = await apiCallWithManualRefresh(() => getReviewsByProductVariantId(variantId));
        const list = res && Array.isArray((res as any).data) ? (res as any).data : (Array.isArray(res) ? res : []);
        // resolve review image object names to URLs
        const enriched = await Promise.all(
          (list || []).map(async (r: any) => {
            let imageUrls: string[] = [];
            if (Array.isArray(r.images) && r.images.length > 0) {
              imageUrls = await Promise.all(
                r.images.map(async (name: string) => {
                  try { return await getImage(name); } catch { return name; }
                })
              );
            }
            return { ...r, imageUrls };
          })
        );
        if (!cancelled) setReviews(enriched);
        // detect my review by matching buyer profile id from JWT
        const myId = getCurrentBuyerId();
        const mine = Array.isArray(list) ? list.find((r: any) => isReviewMine(r, myId)) : null;
        if (!cancelled) {
          setMyReview(mine || null);
          if (mine) {
            setCommentRating(mine.rating || 0);
            setCommentText(mine.comment || '');
          }
        }
      } catch (err) {
        // toast.error("Failed to load reviews"); --- IGNORE ---
      } finally {
        if (!cancelled) setLoadingReviews(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [productVariantIdParam, productData?.productVariantId]);

  const handleFavAdd = async () => {
    const effectiveVariantId = productVariantIdParam || productData.productVariantId;
    if (!effectiveVariantId) { toast.error(t('Variant not selected')); return; }
    try {
      await apiCallWithManualRefresh(() => addToFavourites(effectiveVariantId));
      toast.success("Favourites updated");
      setIsFavorite(true);
      // reflect in local product data
      setInfo((prev: any) => {
        if (!prev) return prev;
        const base = prev?.data ? { ...prev, data: { ...prev.data } } : { ...prev };
        const pd = base.data ?? base;
        if (Array.isArray(pd.variants)) {
          pd.variants = pd.variants.map((v: any) => (String(v.productVariantId ?? v.id) === String(effectiveVariantId) ? { ...v, isFavorite: true } : v));
        } else {
          pd.isFavorite = true;
        }
        return base;
      });
      // emit global event so Navbar can update badges
      try { window.dispatchEvent(new CustomEvent('favourites:updated', { detail: { count: 1 } })); } catch (e) { }
    }
    catch (error: any) {
      // Network/axios specific handling
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        toast.error('Network error: could not reach server. Check your connection or backend.');
      } else if (error.response) {
        if (error.response.status === 401) {
          toast.info(`You have to login in order to manage favourites.`);
          navigator('/login');
        } else {
          toast.error(`Server error: ${error.response.status} ${error.response.statusText}`);
        }
      } else {
        toast.error('Failed to update favourites');
      }
      return;
    }
  };

  const handleFavRemove = async () => {
    const effectiveVariantId = productVariantIdParam || productData.productVariantId;
    if (!effectiveVariantId) { toast.error(t('Variant not selected')); return; }
    try {
      await apiCallWithManualRefresh(() => removeFromFavourites(effectiveVariantId));
      setIsFavorite(false);
      toast.success("Favourites updated");
      setInfo((prev: any) => {
        if (!prev) return prev;
        const base = prev?.data ? { ...prev, data: { ...prev.data } } : { ...prev };
        const pd = base.data ?? base;
        if (Array.isArray(pd.variants)) {
          pd.variants = pd.variants.map((v: any) => (String(v.productVariantId ?? v.id) === String(effectiveVariantId) ? { ...v, isFavorite: false } : v));
        } else {
          pd.isFavorite = false;
        }
        return base;
      });
      try { window.dispatchEvent(new CustomEvent('favourites:updated', { detail: { count: -1 } })); } catch (e) { }
    }
    catch (error: any) {
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
    const effectiveVariantId = productVariantIdParam || productData.productVariantId;
    if (!effectiveVariantId) { toast.error(t('Variant not selected')); return; }
    try {
      await apiCallWithManualRefresh(() => addToCart(effectiveVariantId));
      toast.success("Cart updated");
      setIsInCart(true);
      setInfo((prev: any) => {
        if (!prev) return prev;
        const base = prev?.data ? { ...prev, data: { ...prev.data } } : { ...prev };
        const pd = base.data ?? base;
        if (Array.isArray(pd.variants)) {
          pd.variants = pd.variants.map((v: any) => (String(v.productVariantId ?? v.id) === String(effectiveVariantId) ? { ...v, isInCart: true } : v));
        } else {
          pd.isInCart = true;
        }
        return base;
      });
    }
    catch (error: any) {
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        toast.error('Network error: could not reach server. Check your connection or backend.');
      } else if (error.response) {
        if (error.response.status === 401) {
          toast.info(`You have to login in order to manage cart.`);
          navigator('/login');
        } else {
          toast.error(`Server error: ${error.response.status} ${error.response.statusText}`);
        }
      } else {
        toast.error('Failed to update favourites');
      }
      return;
    }
  };

  const handleCartRemove = async () => {
    const effectiveVariantId = productVariantIdParam || productData.productVariantId;
    if (!effectiveVariantId) { toast.error(t('Variant not selected')); return; }
    try {
      await apiCallWithManualRefresh(() => removeFromCart(effectiveVariantId));
      setIsInCart(false);
      toast.success("Cart updated");
      setInfo((prev: any) => {
        if (!prev) return prev;
        const base = prev?.data ? { ...prev, data: { ...prev.data } } : { ...prev };
        const pd = base.data ?? base;
        if (Array.isArray(pd.variants)) {
          pd.variants = pd.variants.map((v: any) => (String(v.productVariantId ?? v.id) === String(effectiveVariantId) ? { ...v, isInCart: false } : v));
        } else {
          pd.isInCart = false;
        }
        return base;
      });
    }
    catch (error: any) {
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

  // Create review submit handler
  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveVariantId = productVariantIdParam || productData?.productVariantId;
    if (!effectiveVariantId) {
      toast.error(t('Product variant is missing'));
      return;
    }
    if (commentRating < 1 || commentRating > 5) {
      toast.info(t('Please select a rating'));
      return;
    }
    try {
      setCommentSubmitted(true);
      setUploadingImages(true);
      // Upload images sequentially (could be parallel with Promise.all) and collect objectNames
      const uploaded: string[] = [];
      for (const file of selectedFiles) {
        try {
          const objectName = await uploadImage(file);
          uploaded.push(objectName);
        } catch (err) {
          toast.error(t('Failed to upload an image'));
        }
      }
      setUploadingImages(false);
      const bodyComment = commentText.trim() === '' ? null : commentText.trim();
      // Merge kept existing images with newly uploaded ones
      const mergedImages = [...existingImageNames, ...uploaded].slice(0, MAX_IMAGES);
      const bodyImages = mergedImages.length > 0 ? mergedImages : null;
      let res: any;
      if (myReview?.id) {
        // update existing
        res = await apiCallWithManualRefresh(() =>
          editReview(myReview.id, commentRating, bodyComment as any, bodyImages as any)
        );
      } else {
        // try create
        res = await apiCallWithManualRefresh(() =>
          addReview(effectiveVariantId, commentRating, bodyComment as any, bodyImages as any)
        );
        // if backend says duplicate, fallback to edit
        const message = (res as any)?.message || '';
        if ((res as any)?.success === false && /review already exists|already exists/i.test(String(message))) {
          // try to find my review id from loaded reviews
          const mine = myReview || reviews.find((r: any) => {
            try { const dec: any = jwtDecode(tokenStorage.get() || ''); return (r.buyerId || r.userId) === (dec?.id || dec?.sub); } catch { return false; }
          });
          if (mine?.id) {
            res = await apiCallWithManualRefresh(() =>
              editReview(mine.id, commentRating, bodyComment as any, bodyImages as any)
            );
          }
        }
      }
      if ((res as any)?.success === false) {
        // In case the wrapper returns a structured error
        setCommentSubmitted(false);
        const msg = (res as any)?.message || (res as any)?.errors || t('Failed to submit review');
        toast.error(typeof msg === 'string' ? msg : t('Failed to submit review'));
        return;
      }
      toast.success(myReview?.id ? t('Review updated') : t('Review submitted'));
      // Optionally clear form
      setCommentText("");
      setCommentRating(0);
      setSelectedFiles([]);
      setPreviewUrls([]);
      setExistingImageNames([]);
      setExistingImageUrls([]);
      setIsEditingReview(false);
      setCommentSubmitted(false);
      // Refresh reviews after successful submit/update
      try {
        const res2 = await apiCallWithManualRefresh(() => getReviewsByProductVariantId(effectiveVariantId));
        const list2 = res2 && Array.isArray((res2 as any).data) ? (res2 as any).data : (Array.isArray(res2) ? res2 : []);
        const enriched2 = await Promise.all(
          (list2 || []).map(async (r: any) => {
            let imageUrls: string[] = [];
            if (Array.isArray(r.images) && r.images.length > 0) {
              imageUrls = await Promise.all(
                r.images.map(async (name: string) => {
                  try { return await getImage(name); } catch { return name; }
                })
              );
            }
            return { ...r, imageUrls };
          })
        );
        setReviews(enriched2);
        // update myReview from refreshed list
        const myId2 = getCurrentBuyerId();
        const mine2 = Array.isArray(list2) ? list2.find((r: any) => isReviewMine(r, myId2)) : null;
        setMyReview(mine2 || null);
      } catch (e) {
        toast.info("You have to login in order to add or edit reviews.");
      }
      finally {
        setCommentSubmitted(false);
        setUploadingImages(false);
      }
    } catch (error: any) {
      setCommentSubmitted(false);
      setUploadingImages(false);
      if (error?.response?.data) {
        const serverMsg = error.response.data?.message || error.response.data?.title || JSON.stringify(error.response.data);
        toast.error(serverMsg);
      } else if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') {
        toast.error(t('Network error: could not reach server.'));
      } else if (error?.response.status === 401) {
        toast.info(t('You have to login in order to submit a review.'));
        navigator('/login');
      } else if (error?.response) {
        toast.error(`${t('Server error')}: ${error.response.status} ${error.response.statusText}`);
      } else {
        toast.error(t('Failed to submit review'));
      }
    }
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files || []);
    if (!incoming.length) return;
    const valid = incoming.filter(f => /^image\//.test(f.type));
    if (valid.length !== incoming.length) {
      toast.error(t('Some selected files are not images'));
    }
    // Remaining capacity considers existing (kept) + already selected (but not yet uploaded) images
    const remainingCapacity = MAX_IMAGES - existingImageNames.length - selectedFiles.length;
    if (remainingCapacity <= 0) {
      toast.error(t('Maximum images reached. Remove one to add another.'));
      return;
    }
    const toAdd = valid.slice(0, remainingCapacity);
    if (toAdd.length < valid.length) {
      toast.error(t('Some images ignored due to max limit'));
    }
    // Accumulate instead of replace
    setSelectedFiles(prev => [...prev, ...toAdd]);
    setPreviewUrls(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))]);
    // Clear the input value so selecting the same file again triggers onChange
    if (e.target) {
      try { e.target.value = ''; } catch { /* ignore */ }
    }
  };

  const removeImageAt = (idx: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
    setPreviewUrls(prev => prev.filter((_, i) => i !== idx));
  };

  const removeExistingImageAt = async (idx: number) => {
    // Get image name to delete
    const imageName = existingImageNames[idx];
    // If editing a review and image exists, call backend to delete
    if (isEditingReview && myReview?.id && imageName) {
      try {
        // Call editReview with images minus the deleted one
        const updatedImages = existingImageNames.filter((_, i) => i !== idx);
        await apiCallWithManualRefresh(() => editReview(myReview.id, commentRating, commentText, updatedImages));
        toast.success('Image deleted');
        setExistingImageNames(updatedImages);
        setExistingImageUrls(existingImageUrls.filter((_, i) => i !== idx));
      } catch (err) {
        toast.error('Failed to delete image');
      }
    } else {
      setExistingImageNames(prev => prev.filter((_, i) => i !== idx));
      setExistingImageUrls(prev => prev.filter((_, i) => i !== idx));
    }
  };

  const images = Array.isArray(displayImages) ? displayImages : [];

  // State for selected main image index
  const [mainImageIdx, setMainImageIdx] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [slideWidth, setSlideWidth] = useState<number>(420);

  const handleNextImage = () => {
    if (!images.length) return;
    setMainImageIdx((prev) => images.length ? (prev + 1) % images.length : 0);
  };
  const handlePrevImage = () => {
    if (!images.length) return;
    setMainImageIdx((prev) => images.length ? (prev - 1 + images.length) % images.length : 0);
  };

  // Reset the main image index if images array changes to avoid out-of-range index
  useEffect(() => {
    if (!images || images.length === 0) {
      setMainImageIdx(0);
      return;
    }
    setMainImageIdx((prev) => (prev >= images.length ? 0 : prev));
  }, [images.length]);

  // compute slide width from viewport for responsive behaviour
  useEffect(() => {
    const update = () => {
      const w = viewportRef.current?.clientWidth ?? 420;
      setSlideWidth(Math.max(0, Math.floor(w)) || 420);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Group productPropertiesValues by property name (if present)
  const propertyMap: Record<string, string[]> = {};
  if (Array.isArray(productData.productPropertiesValues)) {
    productData.productPropertiesValues.forEach((ppv: any) => {
      const propName = ppv.categoryProperty?.name || 'Property';
      if (!propertyMap[propName]) propertyMap[propName] = [];
      if (!propertyMap[propName].includes(ppv.value)) propertyMap[propName].push(ppv.value);
    });
  }

  // Collect attributes from variants (attributes array) and merge with propertyMap
  const attributeMap: Record<string, string[]> = {};
  if (Array.isArray(productData.variants)) {
    productData.variants.forEach((v: any) => {
      if (Array.isArray(v.attributes)) {
        v.attributes.forEach((a: any) => {
          const name = a.attributeName || 'Attribute';
          if (!attributeMap[name]) attributeMap[name] = [];
          if (a.value && !attributeMap[name].includes(a.value)) attributeMap[name].push(a.value);
        });
      }
    });
  }

  // combinedMap: merge propertyMap and attributeMap (attributeMap values appended)
  const combinedMap: Record<string, string[]> = { ...propertyMap };
  Object.keys(attributeMap).forEach((k) => {
    combinedMap[k] = Array.from(new Set([...(combinedMap[k] ?? []), ...attributeMap[k]]));
  });

  // State for selected value of each property - initialize empty and populate when propertyMap is ready
  const [selectedProperties, setSelectedProperties] = useState<Record<string, string>>({});

  // When a property/attribute select changes, try to find a matching variant and navigate
  const handlePropertyChange = (propName: string, value: string) => {
    const next = { ...selectedProperties, [propName]: value };
    setSelectedProperties(next);
    try {
      if (!Array.isArray(productData.variants) || productData.variants.length === 0) return;
      const target = productData.variants.find((v: any) => {
        const attrs: any[] = Array.isArray(v.attributes) ? v.attributes : [];
        return Object.entries(next).every(([k, val]) => {
          const hit = attrs.find((a: any) => String(a.attributeName || a.name).toLowerCase() === String(k).toLowerCase());
          return !hit || String(hit.value) === String(val);
        });
      });
      const targetVariantId = target?.productVariantId ?? target?.id;
      if (targetVariantId) {
        const path = window.location.pathname;
        const params = new URLSearchParams(window.location.search);
        // Keep product id intact; update only productVariantId param
        params.set('productVariantId', String(targetVariantId));
        // Keep other params if present
        const search = `?${params.toString()}`;
        navigator(`${path}${search}`);
      }
    } catch { /* ignore navigation errors */ }
  };
  useEffect(() => {
    if (!productVariantIdParam || !Array.isArray(productData?.variants)) return;
    const v = productData.variants.find((vv: any) => String(vv.productVariantId ?? vv.id) === String(productVariantIdParam));
    if (!v || !Array.isArray(v.attributes)) return;
    const next: Record<string, string> = { ...selectedProperties };
    v.attributes.forEach((a: any) => {
      const k = String(a.attributeName || a.name || '');
      if (!k) return;
      next[k] = String(a.value ?? '');
    });
    setSelectedProperties(next);
  }, [productVariantIdParam, Array.isArray(productData?.variants) ? productData.variants.length : 0]);

  useEffect(() => {
    const initial: Record<string, string> = {};
    Object.keys(combinedMap).forEach((prop) => {
      initial[prop] = combinedMap[prop]?.[0] ?? '';
    });
    setSelectedProperties((prev) => ({ ...initial, ...prev }));
  }, [JSON.stringify(combinedMap)]);


  const avgRating = Array.isArray(productData.reviews) && productData.reviews.length > 0
    ? productData.reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / productData.reviews.length
    : (productData.averageRating ?? productData.rating ?? 0);

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
      <div className="w-full mx-auto max-w-7xl p-6 bg-white rounded-lg  mt-8 ">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 flex flex-col lg:flex-row items-center gap-10 justify-center">
            <div className="flex flex-col lg:flex-row items-center">
              {Array.isArray(images) && images.length > 0 && (
                <div className="hidden sm:flex-col gap-2 md:mr-4 mb-4 md:mb-0 lg:flex">
                  {images.map((img: any, idx: number) => (
                    <img
                      key={idx}
                      src={img?.imageUrl ?? img?.url ?? img}
                      alt={`Thumbnail ${idx + 1}`}
                      className={`w-16 h-16 object-cover rounded border cursor-pointer select-none ${mainImageIdx === idx ? 'border-gray-800' : 'border-gray-200'}`}
                      style={{ width: 64, height: 64, minWidth: 64, minHeight: 64, maxWidth: 64, maxHeight: 64, resize: 'none', userSelect: 'none', pointerEvents: 'auto' }}
                      draggable={false}
                      onClick={() => setMainImageIdx(idx)}
                    />
                  ))}
                </div>
              )}
              {Array.isArray(images) && images.length > 0 ? (
                <div className="relative w-full flex items-center justify-center" style={{ maxWidth: 420 }}>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 rounded-full shadow p-2 z-10 hover:bg-gray-100 hidden lg:block"
                    aria-label="Previous image"
                  >
                    &#8592;
                  </button>
                  <div ref={viewportRef} className="relative w-full h-[420px] overflow-hidden">
                    <div
                      ref={trackRef}
                      className="flex transition-transform duration-300 ease-in-out"
                      style={{
                        width: `${(images?.length ?? 0) * slideWidth}px`,
                        transform: `translateX(-${mainImageIdx * slideWidth}px)`
                      }}
                    >
                      {images.map((img: any, idx: number) => (
                        <ImageZoom key={idx}>
                          <img
                            src={img?.imageUrl ?? img?.url ?? img}
                            alt={`Product ${idx + 1}`}
                            className="object-cover bg-gray-100 rounded-2xl "
                            style={{ width: slideWidth, height: 420, flexShrink: 0, transition: 'box-shadow 0.2s' }}
                          />
                        </ImageZoom>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 rounded-full shadow p-2 z-10 hover:bg-gray-100 hidden lg:block"
                    aria-label="Next image"
                  >
                    &#8594;
                  </button>
                </div>
              ) : (
                <div className="w-full h-64 w-[420px] bg-gray-200 flex items-center justify-center rounded-lg">
                  {t('No Image')}
                </div>
              )}
              {Array.isArray(images) && images.length > 0 && (
                <div className="flex sm:flex-row gap-2 md:mr-4 mb-4 md:mb-0 lg:hidden mt-4">
                  {images.map((img: any, idx: number) => (
                    <ImageZoom key={idx}>
                      <img
                        src={img?.imageUrl ?? img?.url ?? img}
                        alt={`Thumbnail ${idx + 1}`}
                        className={`w-16 h-16 object-cover rounded border cursor-pointer select-none ${mainImageIdx === idx ? 'border-gray-800' : 'border-gray-200'}`}
                        style={{ width: 64, height: 64, minWidth: 64, minHeight: 64, maxWidth: 64, maxHeight: 64, resize: 'none', userSelect: 'none', pointerEvents: 'auto' }}
                        draggable={false}
                        onClick={() => setMainImageIdx(idx)}
                      />
                    </ImageZoom>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col w-full max-w-4xl gap-4">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{t(displayTitle)}</h1>
                <h1>{t(productData.store?.storeName ?? productData.seller?.name ?? '')}</h1>
              </div>
              <p className="text-muted-foreground">{t(productData.categoryName ?? productData.category ?? '')}</p>
              <div>
                {showDiscount && displayDiscountPrice != 0 ? (
                  <>
                    <Label className='text-3xl font-bold text-red-600'>{displayDiscountPrice}₼</Label>
                    <span className="text-lg line-through text-gray-400 ml-2">{displayPrice}₼</span>
                    <Badge className="bg-red-500 text-white text-xs px-2 py-1 rounded shadow ml-2">-{discountPercent}%</Badge>
                  </>
                ) : (
                  <Label className='text-3xl font-bold'>{displayPrice}₼</Label>
                )}
                {typeof displayOldPrice !== 'undefined' && displayOldPrice !== null && displayOldPrice > displayPrice && (
                  <Badge className="bg-red-600 line-through ml-2">{t('Old Price')}: {displayOldPrice}₼</Badge>
                )}
              </div>
              <div>
                <span className="text-sm m-0 text-muted-foreground">{t('Description')}:</span>
                {productData.description && (
                  <p className="text-gray-700 text-sm">{t(displayDescriptionRaw)}</p>
                )}
              </div>
              <div className="flex gap-1 flex-col">
                <div className='flex items-center'>
                  <span className="text-sm text-muted-foreground">{t('Rating')}:</span>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20}
                      className={i < avgRating ? 'text-yellow-500' : 'text-gray-300'}
                      fill={i < avgRating ? 'currentColor' : 'none'} />
                  ))}
                </div>
                <div className='flex items-center'>
                  <MessageCircle size={16} />
                  <span className="text-sm text-muted-foreground ml-2">{Array.isArray(productData.reviewsCount) ? productData.reviewsCount.length : (productData.reviewsCount || productData.rating || 0)} Comments</span>
                </div>
              </div>
              <div>
                {Object.keys(combinedMap).map((prop) => (
                  <div className="flex flex-col mt-4" key={prop}>
                    <Label>{t(prop)}:</Label>
                    <select
                      value={selectedProperties[prop] ?? combinedMap[prop]?.[0] ?? ''}
                      onChange={e => handlePropertyChange(prop, e.target.value)}
                      className="border rounded p-2"
                    >
                      {combinedMap[prop].map((option) => (
                        <option key={option} value={option}>
                          {t(option)}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                <div className="flex gap-2 mt-4">
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
                      disabled={outOfStock}
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
                    className="px-3 py-2 rounded-xl flex items-center text-sm font-medium bg-gray-100 hover:bg-gray-300 w-12 xl:w-12"
                    title={isFavorite ? "Remove from Favourites" : "Add to Favourites"}
                  >
                    <Heart
                      size={16}
                      className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-500"}
                    />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:flex flex-col lg:flex-row items-start sm:items-center w-full">
          {/* Reviews Section */}
          {loadingReviews && (
            <div className="mt-8 bg-white rounded-lg shadow p-4 max-w-2xl w-full">
              <p className="text-sm text-gray-500">{t('Loading reviews...')}</p>
            </div>
          )}
          {Array.isArray(reviews) && reviews.length > 0 && !loadingReviews && (
            <div className="mt-8 p-4 max-w-4xl w-full" style={{ minHeight: '350px', maxHeight: '470px', overflowY: 'auto' }}>
              <h2 className="text-lg font-semibold mb-2">{t('Reviews')}</h2>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-yellow-500 font-bold text-xl">
                  {(
                    reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / (reviews.length || 1)
                  ).toFixed(1)}
                </span>
                <span className="text-gray-600">/ 5</span>
                <span className="text-gray-500 ml-2">({reviews.length} {t('reviews')})</span>
              </div>
              <div className="space-y-4">
                {reviews.map((review: any) => (
                  <div key={review.id} className="border-b pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'} fill={i < review.rating ? 'currentColor' : 'none'} />
                      ))}
                      <span className="text-xs text-gray-500 ml-2">{review.rating} / 5</span>
                      {review.buyerName && (
                        <span className="text-xs font-bold  ml-2">{t('by')} {review.buyerName}</span>
                      )}
                      {review.createdAt && (
                        <span className="text-xs text-gray-400 ml-2">on {new Date(review.createdAt).toLocaleDateString()}</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-800">{review.comment}</div>
                    {Array.isArray(review.imageUrls) && review.imageUrls.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {review.imageUrls.map((u: string, i: number) => (
                          <ImageZoom key={i}>
                            <img src={u} alt={t('Review image')} className="w-16 h-16 object-cover rounded border" />
                          </ImageZoom>
                        ))}
                      </div>
                    )}
                    {myReview?.id === review.id && (
                      <div className="mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            setCommentRating(review.rating || 0);
                            setCommentText(review.comment || '');
                            const names: string[] = Array.isArray(review.images) ? review.images : [];
                            let urls: string[] = Array.isArray(review.imageUrls) ? review.imageUrls : [];
                            if (urls.length !== names.length) {
                              try {
                                urls = await Promise.all(
                                  names.map(async (n: string) => {
                                    try { return await getImage(n); } catch { return n; }
                                  })
                                );
                              } catch { }
                            }
                            setExistingImageNames(names);
                            setExistingImageUrls(urls);
                            setPreviewUrls([]);
                            setSelectedFiles([]);
                            setIsEditingReview(true);
                            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }}
                        >
                          {t('Edit')}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {(isEditingReview || !myReview) && (
            <form ref={formRef} onSubmit={handleCreateReview} className="mt-8 p-4 max-w-4xl max-h-[470px] w-full">
              <h2 className="text-lg font-semibold mb-2">{t(isEditingReview && myReview ? 'Edit your comment' : 'Add your comment')}</h2>
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
                className="w-full border rounded p-2 mb-2 resize-none"
                rows={3}
                maxLength={maxCommentLength}
                placeholder={t('Write your comment here...')}
                disabled={commentSubmitted}
              />
              <div className="text-right text-xs text-gray-500 mb-2">{commentText.length}/{maxCommentLength} {t('characters')}</div>
              {/* Image upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">{t('Images')}:</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFilesChange}
                  disabled={commentSubmitted || uploadingImages}
                  className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                />
                <div>
                  <p className="text-xs text-gray-500 mt-1">{t('You can upload up to')} {MAX_IMAGES} {t('images')}. {t('Remaining')}: {Math.max(0, MAX_IMAGES - existingImageNames.length - selectedFiles.length)}</p>
                </div>
                {uploadingImages && (
                  <p className="text-xs text-blue-600 mt-1">{t('Uploading images...')}</p>
                )}
                {(existingImageUrls.length > 0 || previewUrls.length > 0) && (
                  <div className="flex flex-row gap-2 mt-2 overflow-x-auto">
                    {existingImageUrls.map((url, idx) => (
                      <div key={`existing-${idx}`} className="relative group">
                        <img src={url} alt={t('Existing image')} className="w-20 h-20 object-cover rounded border" />
                        {!commentSubmitted && (
                          <button
                            type="button"
                            onClick={() => removeExistingImageAt(idx)}
                            className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded px-1 opacity-80 group-hover:opacity-100"
                            aria-label={t('Remove image')}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    {previewUrls.map((url, idx) => (
                      <div key={`new-${idx}`} className="relative group">
                        <img
                          src={url}
                          alt={t('Preview')}
                          className="w-20 h-20 object-cover rounded border"
                        />
                        {!commentSubmitted && (
                          <button
                            type="button"
                            onClick={() => removeImageAt(idx)}
                            className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded px-1 opacity-80 group-hover:opacity-100"
                            aria-label={t('Remove image')}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" className="flex-1" disabled={commentText.length > maxCommentLength || commentRating < 1 || commentSubmitted}>
                  {commentSubmitted ? t('Saving...') : (myReview?.id && isEditingReview ? t('Update Review') : t('Submit Comment'))}
                </Button>
                {isEditingReview && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="min-w-24"
                    onClick={() => {
                      setCommentText('');
                      setCommentRating(0);
                      setSelectedFiles([]);
                      setPreviewUrls([]);
                      setExistingImageNames([]);
                      setExistingImageUrls([]);
                      setIsEditingReview(false);
                    }}
                  >
                    {t('Cancel')}
                  </Button>
                )}
              </div>
            </form>
          )}
        </div>

        <div className="w-full p-6 bg-white rounded-lg mt-8 flex justify-center">
          <div className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.isArray(productData.variants) && productData.variants.length > 0 ? (
              relatedProducts.map((relatedProduct: any) => {
                return (
                  <ProductCard key={relatedProduct.id} product={{ ...relatedProduct }} />
                );
              })
            ) : (
              <p className="text-center text-gray-500">{t('No related products found.')}</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
