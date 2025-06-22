
'use server';

/**
 * @fileOverview An AI-powered product search flow.
 *
 * - productSearch - A function that finds relevant products based on a user's query.
 * - ProductSearchInput - The input type for the productSearch function.
 * - ProductSearchOutput - The return type for the productSearch function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { fetchProductsFromFirestore } from '@/lib/data';

// This is the input to the prompt itself
const PromptInputSchema = z.object({
  query: z.string(),
  productsJson: z.string().describe("A JSON string of all available products."),
});

// This is the input to the overall flow
const ProductSearchInputSchema = z.object({
  query: z.string().describe("The user's search query."),
});
export type ProductSearchInput = z.infer<typeof ProductSearchInputSchema>;

const ProductSearchOutputSchema = z.object({
  productIds: z
    .array(z.string())
    .describe('An array of product IDs that are relevant to the user\'s query.'),
});
export type ProductSearchOutput = z.infer<typeof ProductSearchOutputSchema>;

export async function productSearch(input: ProductSearchInput): Promise<ProductSearchOutput> {
  return productSearchFlow(input);
}

const searchPrompt = ai.definePrompt({
  name: 'productSearchPrompt',
  input: { schema: PromptInputSchema },
  output: { schema: ProductSearchOutputSchema },
  prompt: `You are an intelligent search assistant for an e-commerce store specializing in household goods.
You will be given a user's search query and a JSON string of all available products.
Your task is to analyze the user's natural language query and return the IDs of the products that are the most relevant matches.
Consider the product name, description, category, and features. Return an empty array if no products match.

User's search query: "{{{query}}}"

Here is the list of available products:
{{{productsJson}}}

Based on the query, provide the array of matching product IDs.
`,
});

const productSearchFlow = ai.defineFlow(
  {
    name: 'productSearchFlow',
    inputSchema: ProductSearchInputSchema,
    outputSchema: ProductSearchOutputSchema,
  },
  async ({ query }) => {
    const allProducts = await fetchProductsFromFirestore();

    const simplifiedProducts = allProducts.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      features: p.features || '',
    }));

    const productsJson = JSON.stringify(simplifiedProducts, null, 2);

    const { output } = await searchPrompt({ query, productsJson });

    return output || { productIds: [] };
  }
);
