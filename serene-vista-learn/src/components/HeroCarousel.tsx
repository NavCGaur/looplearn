import { useState, useRef } from "react";
import HeroSection from "./HeroSection";
import SpacedRepetition from "./SpacedRepetition";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';
import { ChevronRight, ChevronLeft } from "lucide-react";
import type { SwiperRef } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const HeroCarousel = () => {
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperRef>(null);
  
  const totalSlides = 2; // HeroSection and SpacedRepetition
  
  const handleNext = () => {
    if (swiperRef.current?.swiper) {
      swiperRef.current.swiper.slideNext();
    }
  };
  
  const handlePrev = () => {
    if (swiperRef.current?.swiper) {
      swiperRef.current.swiper.slidePrev();
    }
  };

  return (
    <div className="relative group w-full max-w-[100vw] overflow-hidden">
      <Swiper
        ref={swiperRef}
        modules={[Autoplay, EffectFade, Navigation, Pagination]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={isAutoplayPaused ? false : { delay: 5000, disableOnInteraction: false }}
        speed={800}
        className="w-full"
        pagination={{
          clickable: true,
          bulletClass: 'w-2 h-2 mx-1 rounded-full bg-gray-300 inline-block transition-all',
          bulletActiveClass: '!w-4 !bg-langlearn-blue'
        }}
        loop={true}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        onTouchStart={() => setIsAutoplayPaused(true)}
        onTouchEnd={() => setTimeout(() => setIsAutoplayPaused(false), 3000)}
      >
        <SwiperSlide className="!w-full">
          <div className="w-full ">
            <HeroSection />
          </div>
        </SwiperSlide>
        <SwiperSlide className="!w-full h-full">
          <div className="w-full h-full">
            <SpacedRepetition />
          </div>
        </SwiperSlide>
      </Swiper>

      {/* Custom Navigation Arrows */}
      <div className="absolute bottom-6 right-6 flex gap-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handlePrev}
          className="carousel-prev-btn w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-100 transition"
          aria-label="Previous slide"
        >
          <ChevronLeft className="text-langlearn-blue" />
        </button>
        <button
          onClick={handleNext}
          className="carousel-next-btn w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-100 transition"
          aria-label="Next slide"
        >
          <ChevronRight className="text-langlearn-blue" />
        </button>
      </div>

      {/* Visual hint for swipe functionality */}
      <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent to-transparent cursor-pointer md:hidden" onClick={handlePrev} />
      <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-transparent to-transparent cursor-pointer md:hidden" onClick={handleNext} />
    </div>
  );
};

export default HeroCarousel;