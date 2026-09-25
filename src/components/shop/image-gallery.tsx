"use client";

import React, { useState } from "react";
import Image from "next/image";

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const validImages = images.length > 0 ? images : [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
  ];
  const [selectedImage, setSelectedImage] = useState(validImages[0]);

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-4">
      {/* Thumbnail Selector */}
      {validImages.length > 1 && (
        <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible shrink-0 pb-2 sm:pb-0">
          {validImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedImage(img)}
              className={`relative h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                selectedImage === img
                  ? "border-indigo-500 shadow-md shadow-indigo-500/20"
                  : "border-zinc-800 hover:border-zinc-700 opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`${productName} thumbnail ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover object-center"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Large Image */}
      <div className="relative aspect-square w-full rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-2xl">
        <Image
          src={selectedImage}
          alt={productName}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover object-center transition-all duration-300"
        />
      </div>
    </div>
  );
}
