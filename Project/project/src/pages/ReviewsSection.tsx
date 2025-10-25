// import React from 'react';

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";

interface Review {
  id: string;
  comment: string;
  rating: number;
  product?: { id: string; name?: string; title?: string; image?: string };
  seller: { id: string; name: string };
  Date?: string;
}

interface ReviewsSectionProps {
  reviews: Review[];
  editingReviewId: string | null;
  setEditingReviewId: (id: string | null) => void;
  editedReview: { comment: string; rating: number };
  setEditedReview: (review: { comment: string; rating: number }) => void;
  saveReview?: (id: string) => void;
  buyer?: any;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  editingReviewId,
  setEditingReviewId,
  editedReview,
  setEditedReview,
  saveReview,
  buyer
}) => {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{buyer?.name ? `${buyer.name}'s Reviews` : "Reviews"}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {reviews.map((r: any) => (
            <li key={r.id} className="border-b pb-4 flex gap-4 items-center">
              <img src={r.product?.image} alt={r.product?.name || r.product?.title || "Product"} className="w-20 h-20 object-cover rounded border" />
              <div className="flex-1">
                <div className="font-semibold">
                  Product: <a href={`/products/${r.product?.id}`} className="text-blue-600 underline">{r.product?.name || r.product?.title}</a>
                  {" "}| Seller: <a href={`/sellers/${r.seller.id}`} className="text-blue-600 underline">{r.seller.name}</a>
                </div>
                {editingReviewId === r.id ? (
                  <div className="mt-2">
                    <Label>Edit Comment</Label>
                    <Input
                      value={editedReview.comment}
                      onChange={e => setEditedReview({ ...editedReview, comment: e.target.value })}
                      className="mb-2"
                    />
                    <Label>Edit Rating</Label>
                    <select
                      value={editedReview.rating}
                      onChange={e => setEditedReview({ ...editedReview, rating: Number(e.target.value) })}
                      className="mb-2 border rounded px-2 py-1"
                    >
                      {[1, 2, 3, 4, 5].map(n => (
                        <option key={n} value={n}>{"★".repeat(n)}{"☆".repeat(5 - n)}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      {saveReview && <Button size="sm" onClick={() => saveReview(r.id)}>Save</Button>}
                      <Button size="sm" variant="outline" onClick={() => setEditingReviewId(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-yellow-500">Rating: {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                    <div className="mt-1 text-gray-700">{r.comment}</div>
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => {
                      setEditingReviewId(r.id);
                      setEditedReview({ comment: r.comment, rating: r.rating });
                    }}>Edit</Button>
                  </>
                )}
              </div>
              <div className="text-sm text-gray-400">{r.Date}</div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default ReviewsSection;
