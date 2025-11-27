// Discount calculation logic for AI recommendations

export interface DiscountOffer {
  discount: number;
  offerText: string;
  reason: string;
}

export function calculateDiscount(flight: any, userHistory?: any): DiscountOffer {
  let discount = 0;
  let offerText = "";
  let reason = "";

  // Early bird discount (if booking more than 7 days in advance)
  const departureDate = new Date(flight.departure);
  const today = new Date();
  const daysUntilDeparture = Math.ceil((departureDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilDeparture > 7) {
    discount = Math.min(15, discount + 10);
    reason = "Early Bird Special";
    offerText = "🎯 Book early and save! Early bird discount applied.";
  }

  // Price-based discount (if price is above average)
  const basePrice = flight.basePriceCents / 100;
  if (basePrice > 50000) {
    discount = Math.min(20, discount + 12);
    reason = "Premium Flight Discount";
    offerText = "💎 Premium flight special offer!";
  } else if (basePrice > 30000) {
    discount = Math.min(15, discount + 8);
    reason = "Mid-range Flight Discount";
    offerText = "⭐ Great deal on this flight!";
  }

  // Time-based discount (off-peak hours)
  const departureHour = departureDate.getHours();
  if (departureHour >= 22 || departureHour <= 6) {
    discount = Math.min(25, discount + 5);
    reason = "Off-peak Discount";
    if (!offerText) {
      offerText = "🌙 Off-peak travel discount!";
    } else {
      offerText += " Plus off-peak savings!";
    }
  }

  // First-time user bonus (would need user context)
  // if (userHistory && userHistory.bookingsCount === 0) {
  //   discount = Math.min(30, discount + 15);
  //   reason = "First Booking Bonus";
  //   offerText = "🎁 Welcome bonus for your first booking!";
  // }

  // AI recommendation bonus (always give a discount for AI-recommended flights)
  // If no other discounts apply, give a base AI discount
  if (discount === 0) {
    discount = 8; // Base 8% discount for AI recommendations
    offerText = "🤖 AI Recommended - Exclusive discount!";
  } else {
    // If other discounts apply, add a small AI bonus
    discount = Math.min(30, discount + 3); // Add 3% bonus, cap at 30%
    if (!offerText.includes("AI")) {
      offerText += " + AI Bonus!";
    }
  }

  return {
    discount: Math.round(discount),
    offerText,
    reason
  };
}

// Apply discount to flight price
export function applyDiscount(flight: any, discountPercent: number) {
  const basePrice = flight.basePriceCents / 100;
  const discountedPrice = basePrice * (1 - discountPercent / 100);
  return {
    ...flight,
    originalPrice: basePrice,
    discountedPrice: discountedPrice,
    savings: basePrice - discountedPrice,
    discountPercent
  };
}

