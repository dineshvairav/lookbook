
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { KnowMoreModal } from '@/components/landing/KnowMoreModal';
import { OnboardingSlides } from '@/components/onboarding/OnboardingSlides';
import { OnboardingAuthModal } from '@/components/auth/OnboardingAuthModal';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LandingPage() {
  const [knowMoreModalOpen, setKnowMoreModalOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Check for the flag on component mount (client-side only)
    if (sessionStorage.getItem('showOnboardingAfterLogout') === 'true') {
      setShowOnboarding(true);
      // Clear the flag so it doesn't trigger again on refresh
      sessionStorage.removeItem('showOnboardingAfterLogout');
    }
  }, []);


  const handleGetStarted = () => {
    setShowOnboarding(true);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setShowAuthModal(true);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    router.push('/shop');
  };
  
  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
    // Optionally, reset to initial landing screen or offer to retry onboarding
    // For now, just closes the modal, user can click "Get Started" again.
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        {/* Basic skeleton or loader can go here */}
      </div>
    );
  }

  if (showOnboarding) {
    return <OnboardingSlides onComplete={handleOnboardingComplete} onSkip={handleOnboardingComplete} />;
  }

  // The Auth Modal is presented on its own screen for better focus
  if (showAuthModal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
        <OnboardingAuthModal
          onLoginSuccess={handleAuthSuccess}
          onClose={handleCloseAuthModal}
        />
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-primary/20 via-background to-accent/20 text-center relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/home_1.png"
          alt="Abstract household-themed background montage"
          layout="fill"
          objectFit="cover"
          className="opacity-20"
          priority
          data-ai-hint="household items"
        />
      </div>
      
      <div className="relative z-10 space-y-8 max-w-2xl">
        <div className="relative flex justify-center mb-4 animate-fade-in-down">
          <div className="p-[2px] rounded-xl logo-container-with-glow">
            <div className="bg-card px-4 py-2 rounded-lg">
              <Image
                src="/logo.png" 
                alt="ushªOªpp Logo"
                width={150}
                height={50}
              />
            </div>
          </div>
        </div>
        <h1 className="text-6xl md:text-7xl font-bold font-headline text-primary animate-fade-in-down text-center">
          ushªOªpp
        </h1>
        <p className="text-xl md:text-2xl text-foreground/80 font-body animate-fade-in-up delay-200">
          Your one-stop destination for quality household goods, from traditional vessels to modern appliances.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-6 animate-fade-in-up delay-400">
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => setKnowMoreModalOpen(true)} 
            className="shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 border-2 border-primary/50 hover:border-primary"
          >
            Know More
          </Button>
          <Button 
            size="lg" 
            onClick={handleGetStarted} 
            className="shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Get Started
          </Button>
        </div>
      </div>

      <KnowMoreModal isOpen={knowMoreModalOpen} onClose={() => setKnowMoreModalOpen(false)} />
       <style jsx global>{`
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down { animation: fade-in-down 0.5s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-400 { animation-delay: 0.4s; }

        .logo-container-with-glow {
          position: relative;
          overflow: hidden; /* This clips the pseudo-element */
          z-index: 1;
        }

        .logo-container-with-glow::before {
          content: '';
          position: absolute;
          z-index: -1;
          top: 50%;
          left: 50%;
          width: 250%;
          height: 250%;
          background: conic-gradient(
            from 0deg,
            hsl(var(--primary)),
            hsl(var(--accent)),
            hsl(var(--primary))
          );
          transform: translate(-50%, -50%);
          animation: rotateGlow 4s linear infinite;
        }

        @keyframes rotateGlow {
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}
