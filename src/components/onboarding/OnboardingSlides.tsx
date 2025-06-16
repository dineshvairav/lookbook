
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ArrowRightToLine, Check } from 'lucide-react';

interface OnboardingSlidesProps {
  onComplete: () => void;
  onSkip: () => void; // This prop will no longer be actively used by an element, as skip now calls onComplete
}

const slidesContent = [
  {
    title: "Welcome to Lookbook!",
    description: "Discover unique styles and the latest trends, curated just for you.",
    image: "https://placehold.co/600x400.png",
    aiHint: "fashion editorial"
  },
  {
    title: "Personalized For You",
    description: "Find what you love with recommendations tailored to your taste.",
    image: "https://placehold.co/600x400.png",
    aiHint: "style moodboard"
  },
  {
    title: "Join Our Community",
    description: "Get started now to explore exclusive collections and connect with fellow fashion enthusiasts.",
    image: "https://placehold.co/600x400.png",
    aiHint: "fashion community"
  },
];

export function OnboardingSlides({ onComplete, onSkip }: OnboardingSlidesProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slidesContent.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete(); // Last slide, proceed to auth
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = slidesContent[currentSlide];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-accent/10 via-background to-primary/10 p-4 relative overflow-hidden">
      {/* The old skip button that was absolutely positioned is removed from here */}

      <div className="bg-card p-6 sm:p-10 rounded-xl shadow-2xl w-full max-w-md text-center relative flex flex-col" style={{minHeight: '70vh'}}>
        <div className="flex-grow flex flex-col items-center justify-center">
          <div className="mb-6 w-full aspect-video relative rounded-lg overflow-hidden">
            <Image
              src={slide.image}
              alt={slide.title}
              layout="fill"
              objectFit="cover"
              data-ai-hint={slide.aiHint}
              className="transition-opacity duration-500 ease-in-out"
              key={currentSlide}
            />
          </div>
          <h2 className="text-3xl font-bold font-headline text-primary mb-3">{slide.title}</h2>
          <p className="text-foreground/80 font-body mb-8 min-h-[60px]">{slide.description}</p>
        </div>

        <div className="mt-auto">
          <div className="flex items-center justify-between w-full pt-6">
            {/* Back Button (Icon only) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              disabled={currentSlide === 0}
              aria-label="Previous slide"
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            {/* Pagination Dots & Inline Skip Icon */}
            <div className="flex items-center space-x-1"> {/* Reduced space for tighter grouping */}
              {slidesContent.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    currentSlide === index ? 'bg-primary w-5' : 'bg-muted w-3 hover:bg-muted-foreground/50' // Adjusted active dot width
                  }`}
                />
              ))}
              {/* Inline Skip Button (replaces top-right one) - calls onComplete */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onComplete}
                aria-label="Skip to Authentication"
                className="ml-2 text-muted-foreground hover:text-foreground" // Added margin and styling
              >
                <ArrowRightToLine className="h-5 w-5" />
              </Button>
            </div>

            {/* Next Button (Icon only) / Complete Icon Button */}
            <Button
              variant={currentSlide === slidesContent.length - 1 ? "default" : "ghost"}
              size="icon"
              onClick={handleNext}
              className={
                currentSlide === slidesContent.length - 1
                ? "" // Primary icon button styles are handled by variant and size
                : "text-muted-foreground hover:text-foreground" // Ghost icon button styles
              }
              aria-label={currentSlide === slidesContent.length - 1 ? "Complete Onboarding" : "Next slide"}
            >
              {currentSlide === slidesContent.length - 1 ? (
                <Check className="h-6 w-6" />
              ) : (
                <ChevronRight className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

