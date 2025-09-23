import { useState } from "react";
import Navbar from "../components/custom/Navbar/navbar";
import Footer from "../components/custom/footer";
import { AppSidebar } from "@/components/custom/sidebar";
import { Card } from "@/components/ui/card";

// Dummy data for demonstration
const reviewsData = [
  {
    id: "r1",
    product: {
      id: "1",
      title: "Sample Product",
      image: "https://via.placeholder.com/150",
    },
    rating: 4,
    comment: "Great sound quality and battery life!",
    reviewer: "John Doe",
    date: "2025-08-10",
  },
  {
    id: "r2",
    product: {
      id: "2",
      title: "Men's T-Shirt",
      image: "https://via.placeholder.com/150/0000FF/808080",
    },
    rating: 5,
    comment: "Very comfortable and fits perfectly.",
    reviewer: "Jane Smith",
    date: "2025-08-09",
  },
];

export default function ReviewsPage() {
  const [reviews] = useState(reviewsData);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex">
        <AppSidebar />
        <div className="flex-1 py-8 px-2 md:px-8">
          <div className="max-w-4xl mx-auto mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-1">Product Reviews</h1>
            <p className="text-gray-500 mb-6">See all reviews left for your products.</p>
            <div className="space-y-6">
              {reviews.map((review) => (
                <Card key={review.id} className="flex gap-4 p-4 items-start bg-white rounded-xl shadow">
                  <img
                    src={review.product.image}
                    alt={review.product.title}
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-semibold text-indigo-700">{review.product.title}</span>
                      <span className="text-yellow-500 text-base">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)} <span className="text-gray-400">({review.rating})</span></span>
                    </div>
                    <div className="text-gray-700 mb-1">{review.comment}</div>
                    <div className="text-xs text-gray-400">By {review.reviewer} on {review.date}</div>
                  </div>
                </Card>
              ))}
              {reviews.length === 0 && (
                <div className="text-gray-500 text-center py-8">No reviews yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}