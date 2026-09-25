"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";
import { getCartCountAction } from "@/actions/cart-actions";

interface CartContextType {
  cartCount: number;
  isLoading: boolean;
  refreshCartCount: () => Promise<number>;
  setCartCount: (count: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [cartCount, setCartCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshCartCount = useCallback(async (): Promise<number> => {
    if (status !== "authenticated") {
      setCartCount(0);
      setIsLoading(false);
      return 0;
    }

    try {
      const count = await getCartCountAction();
      setCartCount(count);
      return count;
    } catch (err) {
      console.error("Failed to refresh cart count:", err);
      return 0;
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    let ignore = false;

    if (status === "authenticated") {
      getCartCountAction()
        .then((count) => {
          if (!ignore) {
            setCartCount(count);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch cart count:", err);
          if (!ignore) {
            setIsLoading(false);
          }
        });
    } else if (status === "unauthenticated") {
      Promise.resolve().then(() => {
        if (!ignore) {
          setCartCount(0);
          setIsLoading(false);
        }
      });
    }

    return () => {
      ignore = true;
    };
  }, [status]);

  return (
    <CartContext.Provider
      value={{
        cartCount,
        isLoading,
        refreshCartCount,
        setCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
