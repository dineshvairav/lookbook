
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ArrowRightToLine, Check } from 'lucide-react';

interface OnboardingSlidesProps {
  onComplete: () => void;
  onSkip: () => void; // This prop will no longer be actively used by an element, as skip now calls onComplete
}

const slidesContent = [
  {
    title: "Welcome to ushªOªpp!",
    description: "Discover unique styles and the latest trends, curated just for you.",
    image: "/home_1.png",
    aiHint: "fashion editorial"
  },
  {
    title: "Personalized For You",
    description: "Find what you love with recommendations tailored to your taste.",
    image: "/home_2.png",
    aiHint: "style moodboard"
  },
  {
    title: "Join Our Community",
    description: "Get started now to explore exclusive collections and connect with fellow fashion enthusiasts.",
    image: "/home_3.png",
    aiHint: "fashion community"
  },
];

const AUTO_SCROLL_INTERVAL = 5000; // 5 seconds

export function OnboardingSlides({ onComplete, onSkip }: OnboardingSlidesProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Don't start a timer if we are on the last slide.
    if (currentSlide === slidesContent.length - 1) {
      return;
    }

    const intervalId = setInterval(() => {
      setCurrentSlide(prevSlide => {
        if (prevSlide < slidesContent.length - 1) {
          return prevSlide + 1;
        }
        // Should not be reached if outer check works, but as a safeguard:
        clearInterval(intervalId); 
        return prevSlide; 
      });
    }, AUTO_SCROLL_INTERVAL);

    // Cleanup function: clear the interval when the component unmounts
    // or when currentSlide changes (which means this effect re-runs).
    return () => clearInterval(intervalId);
  }, [currentSlide]); // Re-run this effect if currentSlide changes.

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

  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
  };

  const slide = slidesContent[currentSlide];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-accent/10 via-background to-primary/10 p-4 relative overflow-hidden">
      <div className="bg-card p-6 sm:p-10 rounded-xl shadow-2xl w-full max-w-md text-center relative flex flex-col" style={{minHeight: '70vh'}}>
        <div className="flex-grow flex flex-col items-center justify-center">
          <div className="mb-6 w-full aspect-video relative rounded-lg overflow-hidden">
             <div
              className="flex transition-transform duration-500 ease-in-out h-full"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slidesContent.map((s, index) => (
                <div key={index} className="w-full h-full flex-shrink-0 relative">
                  <Image
                    src={s.image}
                    alt={s.title}
                    layout="fill"
                    objectFit="cover"
                    data-ai-hint={s.aiHint}
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>
          </div>
          <div key={currentSlide} className="animate-in fade-in duration-500">
            <h2 className="text-3xl font-bold font-headline text-primary mb-3">{slide.title}</h2>
            <p className="text-foreground/80 font-body mb-8 min-h-[60px]">{slide.description}</p>
          </div>
        </div>

        <div className="mt-auto">
          <div className="flex items-center justify-between w-full pt-6">
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

            <div className="flex items-center space-x-1">
              {slidesContent.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    currentSlide === index ? 'bg-primary w-5' : 'bg-muted w-3 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
              <Button
                variant="ghost"
                size="icon"
                onClick={onComplete} // Skip now directly calls onComplete
                aria-label="Skip to Authentication"
                className="ml-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowRightToLine className="h-5 w-5" />
              </Button>
            </div>

            <Button
              variant={currentSlide === slidesContent.length - 1 ? "default" : "ghost"}
              size="icon"
              onClick={handleNext}
              className={
                currentSlide === slidesContent.length - 1
                ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground"
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
