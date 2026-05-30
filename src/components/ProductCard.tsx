// components/ProductCard.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getImageSrc } from "@/lib/getImageSrc";
import AcceptRejectSwitch from "./AcceptRejectSwitch";
import { decideBarter } from "@/lib/notificationService";
import { Pencil } from "lucide-react";

interface BarterInfo {
  _id: string;
  status: "pending" | "approved" | "declined";
  offeredBy?: { _id: string; username: string };
  productOfferedId?: { _id: string; title: string; images: string[] };
}

interface ProductCardProps {
  id: string;
  title: string;
  description?: string;
  images?: string[];
  category?: string;
  owner?: { _id: string; username: string };
  isAvailable?: boolean;
  createdAt?: string;
  showDescription?: boolean;
  className?: string;
  price?: number;
  // New props for barter functionality
  currentUserId?: string;
  barterInfo?: BarterInfo;
  onDecisionMade?: () => void;
}

/**
 * Premium Product Card Component
 * 
 * Features:
 * - Sleek, modern design with soft drop shadows
 * - Clean typography hierarchy
 * - Subtle gradient overlays
 * - Premium hover animations
 * - Minimalist layout with sophisticated color palette
 * - Accept/Reject switch for pending barter requests
 */
const ProductCard: React.FC<ProductCardProps> = ({
  id,
  title,
  description,
  images,
  category,
  owner,
  isAvailable = true,
  createdAt,
  showDescription = true,
  className = "",
  price,
  currentUserId,
  barterInfo,
  onDecisionMade,
}) => {
  const productLink = `/products/${id}`;
  // Ensure images is always an array
  const imageArray = Array.isArray(images) ? images : [];
  const imageSrc = getImageSrc(imageArray?.[0] || "");
  const photoCount = imageArray?.length || 1;

  // Check if product is new (within 48 hours)
  const isNew = createdAt
    ? new Date().getTime() - new Date(createdAt).getTime() < 48 * 60 * 60 * 1000
    : false;

  // Check if current user is the owner and has a pending barter request
  const isOwner = currentUserId && owner?._id === currentUserId;
  const hasPendingBarter = isOwner && barterInfo?.status === "pending";

  // Handle barter decision
  const handleDecision = async (decision: "approved" | "declined") => {
    if (!barterInfo?._id) return;
    try {
      await decideBarter(barterInfo._id, decision);
      onDecisionMade?.();
    } catch (error) {
      console.error("Error making barter decision:", error);
    }
  };

  return (
    <div className="group relative">
      <Link href={productLink} className={`block ${className}`}>
        <article
          className="
            relative 
            rounded-2xl 
            overflow-hidden
            
            /* Premium glass background */
            bg-white/[0.03]
            backdrop-blur-sm
            
            /* Subtle border */
            border border-white/[0.08]
            
            /* Soft drop shadows - default state */
            shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1),0_0_0_1px_rgba(255,255,255,0.03)]
            
            /* Premium hover transitions */
            transition-all 
            duration-300 
            ease-out
            
            /* Hover state - lift and enhanced shadow */
            hover:-translate-y-1
            hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.2),0_8px_10px_-6px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.08),0_0_30px_-10px_rgba(168,85,247,0.3)]
            hover:border-white/[0.12]
            hover:bg-white/[0.05]
          "
        >
          {/* Subtle gradient overlay on card */}
          <div 
            className="
              absolute 
              inset-0 
              opacity-50
              bg-gradient-to-br 
              from-brand-500/5 
              via-transparent 
              to-brand-700/5
              pointer-events-none
              transition-opacity
              duration-300
              group-hover:opacity-70
            " 
          />

          {/* Image Section */}
          <div className="relative h-48 sm:h-52 overflow-hidden">
            {/* Product Image */}
            <Image
              src={imageSrc}
              alt={title || "Product image"}
              fill
              loading="lazy"
              onError={(e) => {
                // Handle image load errors gracefully
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg";
              }}
              className="
                object-cover 
                transition-transform 
                duration-500 
                ease-out
                group-hover:scale-105
              "
            />

            {/* Gradient overlay at bottom of image */}
            <div 
              className="
                absolute 
                inset-0 
                bg-gradient-to-b 
                from-slate-900/10 
                via-transparent 
                to-slate-900/60
                pointer-events-none
              " 
            />

            {/* Shimmer effect overlay on hover */}
            <div 
              className="
                absolute 
                inset-0 
                opacity-0 
                group-hover:opacity-100
                transition-opacity 
                duration-500
                pointer-events-none
                bg-gradient-to-r 
                from-transparent 
                via-white/5 
                to-transparent
                -translate-x-full
                group-hover:translate-x-full
                animate-[shimmer_1.5s_ease-in-out]
              "
            />

            {/* Status Badges */}
            <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
              {/* New Badge */}
              {isNew && (
                <span
                  className="
                    inline-flex
                    items-center
                    px-2.5 
                    py-1
                    rounded-full
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-wider
                    
                    /* Premium purple badge */
                    bg-brand-500/20
                    text-brand-200
                    border border-brand-500/20
                    backdrop-blur-sm
                    
                    /* Subtle hover effect */
                    transition-transform
                    duration-200
                    group-hover:scale-105
                  "
                >
                  New
                </span>
              )}

              {/* Unavailable Badge */}
              {!isAvailable && (
                <span
                  className="
                    inline-flex
                    items-center
                    px-2.5 
                    py-1
                    rounded-full
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-wider
                    
                    /* Muted unavailable badge */
                    bg-red-500/15
                    text-red-300
                    border border-red-500/20
                    backdrop-blur-sm
                  "
                >
                  Unavailable
                </span>
              )}

              {/* Photo Count Badge */}
              {photoCount > 1 && (
                <span
                  className="
                    ml-auto
                    inline-flex
                    items-center
                    gap-1
                    px-2.5 
                    py-1
                    rounded-full
                    text-[10px]
                    font-medium
                    
                    /* Neutral photo count badge */
                    bg-white/80
                    text-slate-700
                    backdrop-blur-sm
                    shadow-sm
                  "
                >
                  <svg 
                    className="w-3 h-3" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                    />
                  </svg>
                  {photoCount}
                </span>
              )}
            </div>

            {/* Edit Button - Only visible to owner */}
            {isOwner && (
              <Link
                href={`/edit-product/${id}`}
                onClick={(e) => e.stopPropagation()}
                className="
                  absolute
                  top-3
                  right-3
                  z-10
                  p-2
                  rounded-full
                  bg-white/80
                  text-slate-700
                  backdrop-blur-sm
                  shadow-sm
                  opacity-0
                  group-hover:opacity-100
                  transition-all
                  duration-200
                  hover:bg-white
                  hover:text-brand-600
                  hover:scale-110
                "
                title="Edit product"
              >
                <Pencil className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Content Section */}
          <div className="relative p-4 sm:p-5">
            {/* Header - Title and Category */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3
                className="
                  text-base 
                  sm:text-lg
                  font-semibold 
                  text-white
                  leading-tight
                  tracking-[-0.01em]
                  line-clamp-1
                  
                  /* Subtle text shadow for depth */
                  [text-shadow:0_1px_2px_rgba(0,0,0,0.1)]
                "
              >
                {title}
              </h3>

              {/* Category/Status Tag */}
              {category && (
                <span
                  className="
                    flex-shrink-0
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-wider
                    px-2
                    py-0.5
                    rounded-full
                    
                    /* Subtle swap tag */
                    bg-emerald-500/10
                    text-emerald-400
                    border border-emerald-500/15
                  "
                >
                  Swap
                </span>
              )}
            </div>

            {/* Price Display */}
            {price !== undefined && price > 0 && (
              <div className="mb-2">
                <span
                  className="
                    inline-flex
                    items-center
                    text-sm
                    font-semibold
                    text-brand-300
                    
                    /* Subtle price styling */
                    bg-brand-500/10
                    px-2
                    py-0.5
                    rounded-md
                  "
                >
                  ${price.toFixed(2)}
                </span>
              </div>
            )}

            {/* Description */}
            {showDescription && description && (
              <p
                className="
                  text-sm 
                  text-white/70
                  leading-relaxed
                  line-clamp-2
                  mb-3
                "
              >
                {description}
              </p>
            )}

            {/* Footer - Owner and CTA */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              {/* Owner Info */}
              {owner?.username && (
                <span className="text-xs text-white/50 font-medium">
                  by{" "}
                  <span className="text-white/70 group-hover:text-brand-300 transition-colors">
                    @{owner.username}
                  </span>
                </span>
              )}

              {/* View CTA */}
              <span
                className="
                  inline-flex
                  items-center
                  gap-1
                  text-sm
                  font-semibold
                  text-brand-400
                  
                  /* CTA animation on hover */
                  transition-all
                  duration-200
                  group-hover:text-brand-300
                  group-hover:translate-x-0.5
                "
              >
                View
                <svg 
                  className="
                    w-4 
                    h-4 
                    transition-transform 
                    duration-200 
                    group-hover:translate-x-1
                  " 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 5l7 7-7 7" 
                  />
                </svg>
              </span>
            </div>
          </div>
        </article>
      </Link>

      {/* Barter Request Overlay - Only show for owner with pending barter */}
      {hasPendingBarter && (
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-slate-900/95 via-slate-900/90 to-transparent rounded-b-2xl z-10">
          <div className="space-y-2">
            {/* Barter request info */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                {barterInfo.productOfferedId?.images?.[0] && (
                  <Image
                    src={getImageSrc(barterInfo.productOfferedId.images[0])}
                    alt={barterInfo.productOfferedId.title || "Barter item"}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-white/60">Barter request for:</p>
                <p className="text-xs text-white font-medium line-clamp-1">
                  {barterInfo.productOfferedId?.title || "Unknown item"}
                </p>
              </div>
            </div>
            
            {/* Accept/Reject Switch */}
            <AcceptRejectSwitch
              barterId={barterInfo._id}
              currentStatus={barterInfo.status}
              onDecision={handleDecision}
              size="sm"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;

/**
 * Loading Skeleton Component for ProductCard
 */
export const ProductCardSkeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div
    className={`
      relative 
      rounded-2xl 
      overflow-hidden
      bg-white/[0.03]
      border border-white/[0.08]
      h-[340px]
      ${className}
    `}
  >
    {/* Shimmer animation */}
    <div className="absolute inset-0 animate-pulse">
      <div className="h-[60%] bg-white/5" />
      <div className="p-4 sm:p-5 space-y-3">
        <div className="h-4 w-2/3 bg-white/5 rounded" />
        <div className="h-3 w-full bg-white/5 rounded" />
        <div className="h-3 w-4/5 bg-white/5 rounded" />
        <div className="pt-2 flex justify-between">
          <div className="h-3 w-20 bg-white/5 rounded" />
          <div className="h-3 w-12 bg-white/5 rounded" />
        </div>
      </div>
    </div>
  </div>
);
