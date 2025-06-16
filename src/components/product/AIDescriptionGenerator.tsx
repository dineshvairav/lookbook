"use client";

import React, { useState } from "react";
import { generateProductDescription } from "@/ai/flows/generate-product-description";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AIDescriptionGeneratorProps {
  productName: string;
  currentDescription: string;
  features: string;
}

export function AIDescriptionGenerator({
  productName,
  currentDescription,
  features,
}: AIDescriptionGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [aiDescription, setAiDescription] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerateDescription = async () => {
    setIsLoading(true);
    setAiDescription(null);
    try {
      const result = await generateProductDescription({
        productName,
        productDescription: currentDescription,
        productFeatures: features,
      });
      setAiDescription(result.aiGeneratedDescription);
      toast({
        title: "AI Description Generated",
        description: "A new description has been created.",
      });
    } catch (error) {
      console.error("Failed to generate AI description:", error);
      toast({
        title: "Error Generating Description",
        description: "Could not generate AI description. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <Card className="mt-8 border-dashed border-accent">
      <CardHeader>
        <CardTitle className="flex items-center font-headline text-xl">
          <Sparkles className="mr-2 h-5 w-5 text-accent" />
          AI-Powered Description
        </CardTitle>
        <CardDescription className="font-body">
          Generate an alternative marketing copy for this product using AI.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleGenerateDescription}
          disabled={isLoading}
          className="mb-4 w-full sm:w-auto"
          variant="outline"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {isLoading ? "Generating..." : "Generate AI Description"}
        </Button>
        {aiDescription && (
          <div className="mt-4 p-4 bg-accent/10 rounded-md">
            <h4 className="font-semibold mb-2 font-headline">Generated Description:</h4>
            <Textarea
              value={aiDescription}
              readOnly
              rows={6}
              className="font-body bg-background"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
