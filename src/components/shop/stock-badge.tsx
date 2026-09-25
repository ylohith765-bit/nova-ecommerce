import React from "react";
import { Badge } from "@/components/ui/badge";

interface StockBadgeProps {
  stock: number;
  className?: string;
}

export function StockBadge({ stock, className }: StockBadgeProps) {
  if (stock <= 0) {
    return (
      <Badge variant="danger" className={className}>
        Out of Stock
      </Badge>
    );
  }

  if (stock <= 5) {
    return (
      <Badge variant="warning" className={className}>
        Only {stock} left
      </Badge>
    );
  }

  return (
    <Badge variant="success" className={className}>
      In Stock
    </Badge>
  );
}
