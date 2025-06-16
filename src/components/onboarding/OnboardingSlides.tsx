
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, XCircle, Circle } from 'lucide-react'; // Using XCircle for skip

interface OnboardingSlidesProps {
  onComplete: () => void;
  onSkip: () => void;
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
      <Button
        variant="ghost"
        size="icon"
        onClick={onSkip}
        className="absolute top-6 right-6 text-muted-foreground hover:text-foreground z-20"
        aria-label="Skip onboarding"
      >
        <XCircle className="h-6 w-6" />
      </Button>

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
          <div className="flex justify-center space-x-2 mb-8">
            {slidesContent.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-3 w-3 rounded-full transition-all duration-300 ${
                  currentSlide === index ? 'bg-primary scale-125' : 'bg-muted hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>

          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={handleBack} disabled={currentSlide === 0} className="px-6">
              <ChevronLeft className="mr-1 h-5 w-5" /> Back
            </Button>
            <Button onClick={handleNext} className="px-6 bg-primary hover:bg-primary/90 text-primary-foreground">
              {currentSlide === slidesContent.length - 1 ? 'Get Started' : 'Next'}
              {currentSlide < slidesContent.length - 1 && <ChevronRight className="ml-1 h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
