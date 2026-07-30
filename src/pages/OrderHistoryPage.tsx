import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Star, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import { useNavigate } from 'react-router-dom';

export function OrderHistoryPage() {
  const { currentUser } = useAuth();
  const { orders, reviews, addReview } = useOrder();
  const navigate = useNavigate();

  // State to track which item is currently being reviewed
  const [reviewingItemId, setReviewingItemId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  
  // Track submitted reviews locally to immediately update UI
  const [submittedReviews, setSubmittedReviews] = useState<Record<string, { rating: number; text: string }>>({});

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // If not logged in, just show a message (though navigation should ideally prevent this)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#040A11] pt-32 pb-12 px-4 flex flex-col items-center justify-center text-center">
        <Package className="w-16 h-16 text-[#212A33] mb-4" />
        <h1 className="text-2xl font-display font-bold text-[#F6F9FC] mb-2">Sign in to view orders</h1>
        <p className="text-[#8F9AA4]">Please sign in or create an account to view your order history.</p>
      </div>
    );
  }

  // Filter orders for current user
  const userOrders = orders.filter(o => o.userId === currentUser.id);

  const handleSubmitReview = async (model: string, vehicleModelId: number) => {
    if (reviewRating === 0 || !reviewText.trim()) return;

    // Basic XSS protection: escape html tags
    const sanitizedText = reviewText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    const success = await addReview(vehicleModelId, sanitizedText, reviewRating);
    if (success) {
      setSubmittedReviews(prev => ({
        ...prev,
        [model]: { rating: reviewRating, text: sanitizedText }
      }));
    } else {
      alert("Failed to submit review.");
    }

    // Reset state
    setReviewingItemId(null);
    setReviewRating(0);
    setReviewText('');
  };

  return (
    <div className="min-h-screen bg-[#040A11] pt-32 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-display font-bold text-[#F6F9FC] mb-12 border-b border-[#212A33] pb-6">
          Order History
        </h1>

        {userOrders.length === 0 ? (
          <div className="text-center py-16 bg-[#0B151F] rounded-3xl border border-[#212A33]">
            <Package className="w-12 h-12 text-[#212A33] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#F6F9FC] mb-2">No orders yet</h2>
            <p className="text-[#8F9AA4] mb-6">Looks like you haven't placed any orders.</p>
            <button
              onClick={() => navigate('/shop')}
              className="bg-[#68E371] hover:bg-[#52c95b] text-[#050C13] font-bold py-3 px-8 rounded-xl transition-colors shadow-[0_0_20px_rgba(104,227,113,0.15)]"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {userOrders.map((order) => (
              <div key={order.id} className="bg-[#0B151F] border border-[#212A33] rounded-3xl overflow-hidden">
                {/* Order Header */}
                <div className="border-b border-[#212A33] p-6 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex gap-8 md:gap-12 text-sm">
                    <div>
                      <p className="text-[#8F9AA4] font-semibold mb-1 uppercase text-xs tracking-wider">Order Placed</p>
                      <p className="text-[#F6F9FC] font-bold">{order.datePlaced}</p>
                    </div>
                    <div>
                      <p className="text-[#8F9AA4] font-semibold mb-1 uppercase text-xs tracking-wider">Total Amount</p>
                      <p className="text-[#F6F9FC] font-bold">${order.totalAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[#8F9AA4] font-semibold mb-1 uppercase text-xs tracking-wider">Order #</p>
                      <p className="text-[#F6F9FC] font-bold">{order.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-[#F6F9FC] px-4 py-1.5 rounded-full text-[#050C13] font-bold text-sm shadow-sm">
                    <CheckCircleIcon className="w-4 h-4" />
                    {order.status}
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6 space-y-6">
                  {order.items.map((item, index) => {
                    const uniqueItemId = `${order.id}-${item.vin}-${index}`;
                    const isReviewing = reviewingItemId === uniqueItemId;
                    const modelName = `${item.brand} ${item.model}`;
                    
                    const existingReview = reviews.find(
                      r => r.userId === currentUser.id && r.vehicleModel === modelName
                    );

                    const newlySubmitted = submittedReviews[modelName];
                    const isReviewed = existingReview || newlySubmitted;
                    const ratingToShow = existingReview?.rating || newlySubmitted?.rating || 0;

                    return (
                      <div key={uniqueItemId} className="flex flex-col gap-4">
                        <div className="flex items-center gap-6">
                          <div className="w-32 h-20 bg-[#14202D] rounded-xl overflow-hidden flex-shrink-0">
                            <img src={item.image} alt={modelName} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-[#F6F9FC]">{item.year} {modelName}</h3>
                            <p className="text-sm text-[#8F9AA4] mt-1">VIN: {item.vin}</p>
                          </div>
                          {isReviewed ? (
                            <div className="flex flex-col items-end">
                              <div className="flex items-center gap-1 text-[#68E371] mb-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-3.5 h-3.5 ${i < ratingToShow ? 'fill-current' : 'text-[#212A33] fill-[#212A33]'}`} />
                                ))}
                              </div>
                              <span className="text-xs text-[#8F9AA4] font-semibold">Reviewed</span>
                            </div>
                          ) : (
                            <button 
                              className="text-[#8F9AA4] hover:text-[#68E371] text-sm font-semibold transition-colors flex items-center"
                              onClick={() => {
                                if (isReviewing) {
                                  setReviewingItemId(null);
                                } else {
                                  setReviewingItemId(uniqueItemId);
                                  setReviewRating(0);
                                  setReviewText('');
                                }
                              }}
                            >
                              {isReviewing ? 'Cancel Review' : 'Write Review'}
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                          )}
                        </div>

                        {/* Review Form Expansion */}
                        {isReviewing && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-[#050C13] border border-[#212A33] rounded-2xl p-6 mt-2 overflow-hidden"
                          >
                            <h4 className="text-center font-bold text-[#F6F9FC] mb-4">How was your experience with the {modelName}?</h4>
                            
                            <div className="flex justify-center gap-2 mb-6">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => setReviewRating(star)}
                                  className="focus:outline-none transition-transform hover:scale-110"
                                >
                                  <Star 
                                    className={`w-8 h-8 ${star <= reviewRating ? 'fill-[#68E371] text-[#68E371]' : 'text-[#212A33]'}`} 
                                  />
                                </button>
                              ))}
                              <span className="text-[#8F9AA4] text-sm ml-4 self-center">{reviewRating} of 5</span>
                            </div>

                            <textarea
                              value={reviewText}
                              onChange={(e) => setReviewText(e.target.value)}
                              placeholder="Tell us about the vehicle and delivery process..."
                              className="w-full bg-[#0B151F] border border-[#212A33] rounded-xl p-4 text-[#F6F9FC] placeholder-[#304050] focus:outline-none focus:border-[#68E371] min-h-[100px] resize-none mb-4"
                            />

                            <div className="flex justify-end gap-3">
                              <button
                                onClick={() => setReviewingItemId(null)}
                                className="px-6 py-2 rounded-lg text-[#8F9AA4] hover:text-[#F6F9FC] font-semibold transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSubmitReview(modelName, item.vehicleModelId)}
                                disabled={reviewRating === 0 || !reviewText.trim()}
                                className="bg-[#F6F9FC] text-[#050C13] hover:bg-[#E2E8F0] disabled:opacity-50 disabled:cursor-not-allowed font-bold px-6 py-2 rounded-lg transition-colors"
                              >
                                Submit Review
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Simple icon for the status badge
function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
