"use client";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { ArrowRight, Clock, Flame, Star, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Countdown from "react-countdown";
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useHasHydrated } from "@/hooks/useHasHydrated";
import { formatCurrency } from "@/utils/formatCurrency";

const FLASH_SALE_PRODUCTS = [
  {
    id: "1",
    title: "Premium Slim Fit T-Shirt",
    price: 39.99,
    salePrice: 19.99,
    discount: 50,
    image: "/ao-thun.webp",
    rating: 4.7,
    reviews: 128,
    sold: 342,
    available: 58,
  },
  {
    id: "2",
    title: "Athletic Running Shoes",
    price: 129.99,
    salePrice: 69.99,
    discount: 46,
    image: "/ao-thun.webp",
    rating: 4.9,
    reviews: 256,
    sold: 421,
    available: 39,
  },
  {
    id: "3",
    title: "Designer Denim Jacket",
    price: 89.99,
    salePrice: 49.99,
    discount: 44,
    image: "/ao-thun.webp",
    rating: 4.5,
    reviews: 93,
    sold: 211,
    available: 47,
  },
  {
    id: "4",
    title: "Casual Summer Shorts",
    price: 49.99,
    salePrice: 29.99,
    discount: 40,
    image: "/ao-thun.webp",
    rating: 4.6,
    reviews: 75,
    sold: 187,
    available: 63,
  },
  {
    id: "5",
    title: "Lightweight Hiking Backpack",
    price: 79.99,
    salePrice: 39.99,
    discount: 50,
    image: "/ao-thun.webp",
    rating: 4.8,
    reviews: 104,
    sold: 156,
    available: 22,
  },
  {
    id: "6",
    title: "Premium Wireless Headphones",
    price: 149.99,
    salePrice: 79.99,
    discount: 47,
    image: "/ao-thun.webp",
    rating: 4.9,
    reviews: 312,
    sold: 523,
    available: 15,
  },
];

const StockProgressBar = ({
  sold,
  available,
}: {
  sold: number;
  available: number;
}) => {
  const total = sold + available;
  const soldPercent = (sold / total) * 100;

  return (
    <div className="w-full mt-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600">Sold: {sold}</span>
        <span className="text-gray-600">Available: {available}</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary"
          style={{ width: `${soldPercent}%` }}
        />
      </div>
    </div>
  );
};

type CountdownProps = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  completed: boolean;
};

export const CountdownRenderer = ({
  days,
  hours,
  minutes,
  seconds,
  completed,
}: CountdownProps) => {
  if (completed) {
    return <span>Sale ended!</span>;
  }

  return (
    <div className="flex gap-2 sm:gap-3 items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="bg-primary text-white text-xl sm:text-2xl font-bold rounded px-2 sm:px-3 py-1 min-w-[40px] sm:min-w-[50px] text-center">
          {days}
        </div>
        <span className="text-xs mt-1">Days</span>
      </div>
      <span className="text-xl sm:text-2xl font-bold text-gray-400">:</span>
      <div className="flex flex-col items-center">
        <div className="bg-primary text-white text-xl sm:text-2xl font-bold rounded px-2 sm:px-3 py-1 min-w-[40px] sm:min-w-[50px] text-center">
          {hours}
        </div>
        <span className="text-xs mt-1">Hours</span>
      </div>
      <span className="text-xl sm:text-2xl font-bold text-gray-400">:</span>
      <div className="flex flex-col items-center">
        <div className="bg-primary text-white text-xl sm:text-2xl font-bold rounded px-2 sm:px-3 py-1 min-w-[40px] sm:min-w-[50px] text-center">
          {minutes}
        </div>
        <span className="text-xs mt-1">Mins</span>
      </div>
      <span className="text-xl sm:text-2xl font-bold text-gray-400">:</span>
      <div className="flex flex-col items-center">
        <div className="bg-primary text-white text-xl sm:text-2xl font-bold rounded px-2 sm:px-3 py-1 min-w-[40px] sm:min-w-[50px] text-center">
          {seconds}
        </div>
        <span className="text-xs mt-1">Secs</span>
      </div>
    </div>
  );
};

export default function FlashSale() {
  const [endTime] = useState(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const hasHydrated = useHasHydrated();

  if (!hasHydrated) {
    return null;
  }
  return (
    <section className="bg-gradient-to-r from-rose-50 to-amber-50 py-12 px-4 overflow-hidden">
      <div className="container mx-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-6 w-6 text-red-500 animate-pulse" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Flash Sale
            </h2>
            <Zap className="h-6 w-6 text-red-500 animate-pulse" />
          </div>
          <p className="text-gray-600 text-center mb-6">
            Super deals that you don&#39;t want to miss. Grab them before
            they&#39;re gone!
          </p>

          {/* Countdown timer */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="h-5 w-5" />
              <span className="font-medium">Ends in:</span>
            </div>
            {hasHydrated && (
              <Countdown date={endTime} renderer={CountdownRenderer} />
            )}
          </div>
        </div>

        {/* Product carousel */}
        <div className="relative">
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm z-10 rounded-full flex items-center justify-center shadow-md cursor-pointer swiper-custom-prev">
            <ArrowRight className="h-5 w-5 rotate-180" />
          </div>
          <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm z-10 rounded-full flex items-center justify-center shadow-md cursor-pointer swiper-custom-next">
            <ArrowRight className="h-5 w-5" />
          </div>

          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            navigation={{
              nextEl: ".swiper-custom-next",
              prevEl: ".swiper-custom-prev",
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
              },
              768: {
                slidesPerView: 3,
              },
              1024: {
                slidesPerView: 4,
              },
            }}
            className="flash-sale-swiper"
          >
            {FLASH_SALE_PRODUCTS.map((product) => (
              <SwiperSlide key={product.id}>
                <Link href={`/product/${product.id}`}>
                  <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                    <div className="relative">
                      <div className="aspect-[3/4] relative overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.title}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <Badge
                        variant="destructive"
                        className="absolute top-2 left-2 px-2 py-1 flex items-center gap-1"
                      >
                        <Flame className="size-3" />-{product.discount}%
                      </Badge>

                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{product.rating}</span>
                          <span className="text-sm">({product.reviews})</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-2 flex flex-col flex-grow">
                      <h3 className="font-medium text-gray-900  line-clamp-2 h-10">
                        {product.title}
                      </h3>

                      <div className="flex items-baseline gap-2 ">
                        <span className="text-lg font-bold text-red-600">
                          {formatCurrency(product.salePrice)}
                        </span>
                        <span className="text-gray-500 text-sm line-through">
                          {formatCurrency(product.price)}
                        </span>
                      </div>

                      <StockProgressBar
                        sold={product.sold}
                        available={product.available}
                      />

                      <div className="mt-4">
                        <Button variant="destructive" className="w-full">
                          Shop Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="flex justify-center mt-8">
          <Link href="/flash-sale">
            <Button variant="outline" className="flex items-center gap-2 group">
              View All Flash Sale Items
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
