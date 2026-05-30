// components/AcceptRejectSwitch.tsx
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Loader2 } from "lucide-react";

interface AcceptRejectSwitchProps {
  barterId: string;
  currentStatus: "pending" | "approved" | "declined";
  onDecision: (decision: "approved" | "declined") => Promise<void>;
  disabled?: boolean;
  size?: "sm" | "md";
}

const AcceptRejectSwitch: React.FC<AcceptRejectSwitchProps> = ({
  barterId,
  currentStatus,
  onDecision,
  disabled = false,
  size = "md",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState(currentStatus);

  const handleDecision = async (decision: "approved" | "declined") => {
    if (disabled || isLoading || localStatus !== "pending") return;

    setIsLoading(true);
    try {
      await onDecision(decision);
      setLocalStatus(decision);
    } catch (error) {
      console.error("Error making decision:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: {
      button: "px-2.5 py-1 text-[10px]",
      icon: "w-3 h-3",
    },
    md: {
      button: "px-3 py-1.5 text-xs",
      icon: "w-3.5 h-3.5",
    },
  };

  // If already decided, show status badge
  if (localStatus === "approved") {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs font-medium">
        <Check className="w-3.5 h-3.5" />
        Accepted
      </div>
    );
  }

  if (localStatus === "declined") {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-medium">
        <X className="w-3.5 h-3.5" />
        Declined
      </div>
    );
  }

  // Pending state - show switch buttons
  return (
    <div className="flex items-center gap-2">
      {/* Accept Button */}
      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        onClick={() => handleDecision("approved")}
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center gap-1 ${sizeClasses[size].button} font-medium 
          bg-green-500/20 text-green-400 rounded-lg 
          hover:bg-green-500/30 transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {isLoading ? (
          <Loader2 className={`${sizeClasses[size].icon} animate-spin`} />
        ) : (
          <Check className={sizeClasses[size].icon} />
        )}
        Accept
      </motion.button>

      {/* Decline Button */}
      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        onClick={() => handleDecision("declined")}
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center gap-1 ${sizeClasses[size].button} font-medium 
          bg-red-500/20 text-red-400 rounded-lg 
          hover:bg-red-500/30 transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {isLoading ? (
          <Loader2 className={`${sizeClasses[size].icon} animate-spin`} />
        ) : (
          <X className={sizeClasses[size].icon} />
        )}
        Decline
      </motion.button>
    </div>
  );
};

export default AcceptRejectSwitch;
