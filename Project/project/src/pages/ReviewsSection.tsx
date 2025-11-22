import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiCallWithManualRefresh } from "@/shared/apiWithManualRefresh";
import { getBuyerReviews } from "@/features/services/ Reviews/Reviews.service";
import { deleteReview as deleteReviewApi, editReview as editReviewApi } from "@/features/services/ Reviews/Reviews.service";
import { getImage, uploadImage } from "@/shared/utils/imagePost";
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom";
import type { Review, ReviewsSectionProps } from "@/features/services/DTOs/interfaces";

const ReviewsSection: React.FC<ReviewsSectionProps> = (props) => {
  const {
    editingReviewId,
    setEditingReviewId,
    editedReview,
    setEditedReview,
    saveReview,
    buyer,
  } = props || {};
  const [localReviews, setLocalReviews] = useState<Review[]>([]);
  // Local state for images being added while editing
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedPreviews, setSelectedPreviews] = useState<string[]>([]);
  // Track deleted old images by review id
  const [deletedOldImages, setDeletedOldImages] = useState<Record<string, Set<string>>>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    async function load() {
      try {
        const res = await apiCallWithManualRefresh(() => getBuyerReviews());
        let items: any[] = Array.isArray(res)
          ? res
          : Array.isArray((res as any)?.data)
            ? (res as any).data
            : Array.isArray((res as any)?.data?.data)
              ? (res as any).data.data
              : [];
        // Resolve image IDs to URLs
        items = await Promise.all(
          items.map(async (r: any) => {
            const imgs: string[] = Array.isArray(r.images) ? r.images : [];
            const imageUrls: string[] = await Promise.all(
              imgs.map(async (id: string) => {
                try {
                  const url = await getImage(id);
                  return url || id;
                } catch {
                  return id;
                }
              })
            );
            return { ...r, imageUrls } as Review;
          })
        );
        if (!cancelled) setLocalReviews(items as Review[]);
      } catch (e) {
        if (!cancelled) setLocalReviews([]);
      }
    }
    load();
    setLoading(false);
    return () => { cancelled = true; };
  }, []);

  const navigate = useNavigate();
  return (
    <div>
      {loading && <div className="text-center">Loading...</div>}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>{buyer?.name ? `${buyer.name}'s Reviews` : "Reviews"}</CardTitle>
        </CardHeader>
        <CardContent>
          {localReviews.length === 0 ? (
            <div className="text-center text-gray-500">No reviews yet.</div>
          ) : (
            <ul className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {localReviews.map((r: Review) => (
                <li key={r.id} className="border-b pb-4 flex gap-4 items-center">
                  <div className="flex-1">
                    <div className="font-semibold">{r.buyerName || buyer?.name || "You"}</div>
                    {editingReviewId === r.id ? (
                      <>
                        <div className="mt-2">
                          <Label>Add Images</Label>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []).filter((f) => f && f.type.startsWith('image/')) as File[];
                              setSelectedFiles(files);
                              setSelectedPreviews(files.map((f) => URL.createObjectURL(f)));
                            }}
                          />
                          {(Array.isArray(r.imageUrls) && r.imageUrls.length > 0) && (
                            <div className="mt-2 flex gap-2 flex-wrap max-h-40 overflow-y-auto pr-1">
                              {r.imageUrls.map((src, i) => {
                                // Only show if not deleted
                                const isDeleted = deletedOldImages[r.id]?.has(src);
                                if (isDeleted) return null;
                                return (
                                  <div key={i} className="relative group">
                                    <ImageZoom>
                                      <img src={src} alt={`old-${i}`} className="w-16 h-16 object-cover rounded border" />
                                    </ImageZoom>
                                    <button
                                      type="button"
                                      className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-80 group-hover:opacity-100"
                                      title="Delete image"
                                      onClick={() => {
                                        setDeletedOldImages(prev => {
                                          const set = new Set(prev[r.id] || []);
                                          set.add(src);
                                          return { ...prev, [r.id]: set };
                                        });
                                      }}
                                    >×</button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {selectedPreviews.length > 0 && (
                            <div className="mt-2 flex gap-2 flex-wrap max-h-40 overflow-y-auto pr-1">
                              {selectedPreviews.map((src, i) => (
                                <img key={i} src={src} alt={`new-${i}`} className="w-16 h-16 object-cover rounded border" />
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="mt-2">
                          <Label>Edit Comment</Label>
                          <Input
                            value={editedReview?.comment ?? ""}
                            onChange={e => setEditedReview && setEditedReview({ ...(editedReview as any), comment: e.target.value })}
                            className="mb-2"
                          />
                          <Label>Edit Rating</Label>
                          <div className="mb-2 flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                type="button"
                                aria-label={`Set rating ${star}`}
                                className={(editedReview?.rating ?? 0) >= star ? 'text-yellow-500 text-2xl' : 'text-gray-300 hover:text-yellow-400 text-2xl'}
                                onClick={() => setEditedReview && setEditedReview({ ...(editedReview as any), rating: star })}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={async () => {
                                if (!editedReview) return;
                                try {
                                  // Get remaining old images (not deleted)
                                  const deletedSet = deletedOldImages[r.id] || new Set();
                                  const remainingOldImages = (r.imageUrls || []).filter((src) => !deletedSet.has(src));
                                  // Upload new images if any
                                  let newImageIds: string[] = [];
                                  if (selectedFiles.length > 0) {
                                    const uploaded = await Promise.all(selectedFiles.map(async (file) => uploadImage(file)));
                                    newImageIds = uploaded.filter(Boolean) as string[];
                                  }
                                  // Combine old and new image IDs (assuming imageUrls are URLs, need to map back to IDs if possible)
                                  // If you have a way to map URLs to IDs, do it here. For now, assume URLs are IDs or can be used as such.
                                  const allImageIds = [...remainingOldImages, ...newImageIds];
                                  await apiCallWithManualRefresh(() => editReviewApi(r.id, editedReview.rating, editedReview.comment, allImageIds));
                                  // Update UI
                                  const allImageUrls = [
                                    ...remainingOldImages,
                                    ...(
                                      newImageIds.length > 0
                                        ? (await Promise.all(newImageIds.map((id) => getImage(id).catch(() => "")))).filter(Boolean)
                                        : []
                                    )
                                  ];
                                  setLocalReviews(prev => prev.map(rv => rv.id === r.id ? { ...rv, comment: editedReview.comment, rating: editedReview.rating, imageUrls: allImageUrls } : rv));
                                  setEditingReviewId && setEditingReviewId(null);
                                  setSelectedFiles([]);
                                  setSelectedPreviews([]);
                                  setDeletedOldImages(prev => ({ ...prev, [r.id]: new Set() }));
                                } catch {
                                  // Optionally add toast here
                                }
                              }}
                              disabled={
                                !editedReview || 
                                typeof editedReview.rating !== 'number' || 
                                editedReview.rating < 1 || 
                                editedReview.rating > 5 || 
                                !(editedReview.comment || '').trim()
                              }
                            >
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => {
                              setEditingReviewId && setEditingReviewId(null);
                              setSelectedFiles([]);
                              setSelectedPreviews([]);
                              setDeletedOldImages(prev => ({ ...prev, [r.id]: new Set() }));
                            }}>Cancel</Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={async () => {
                                try {
                                  if (props.deleteReview) {
                                    await props.deleteReview(r.id);
                                  } else {
                                    await apiCallWithManualRefresh(() => deleteReviewApi(r.id));
                                  }
                                  setLocalReviews(prev => prev.filter(rv => rv.id !== r.id));
                                } catch {
                                  // Optionally add toast here
                                }
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-yellow-500">Rating: {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                        <div className="mt-1 text-gray-700">{r.comment}</div>
                        {Array.isArray(r.imageUrls) && r.imageUrls.length > 0 && (
                          <div className="mt-2 flex gap-2 flex-wrap max-h-40 overflow-y-auto pr-1">
                            {r.imageUrls.map((u, i) => (
                              <ImageZoom key={i}>
                                <img src={u} alt={`review-${i}`} className="w-16 h-16 object-cover rounded border" />
                              </ImageZoom>
                            ))}
                          </div>
                        )}
                        {/* Product page link */}
                        {r.productVariantId && r.productId && (
                          <div className="mt-2">
                            <a
                              href={`/product?Id=${r.productId}&productVariantId=${r.productVariantId}`}
                              className="text-blue-600 hover:underline text-sm"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View Product Page
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-3">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              aria-label={`Set rating ${star}`}
                              className={"text-xl " + (star <= r.rating ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400')}
                              onClick={() => {
                                setEditingReviewId && setEditingReviewId(r.id);
                                setEditedReview && setEditedReview({ comment: r.comment, rating: star });
                              }}
                            >
                              ★
                            </button>
                          ))}
                          <Button size="sm" variant="outline" onClick={() => {
                            setEditingReviewId && setEditingReviewId(r.id);
                            setEditedReview && setEditedReview({ comment: r.comment, rating: r.rating });
                          }}>Edit</Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={async () => {
                              try {
                                if (props.deleteReview) {
                                  await props.deleteReview(r.id);
                                } else {
                                  await apiCallWithManualRefresh(() => deleteReviewApi(r.id));
                                }
                                setLocalReviews(prev => prev.filter(rv => rv.id !== r.id));
                              } catch {
                                // Optionally toast error
                              }
                            }}
                          >Delete</Button>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">{r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}</div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewsSection;
