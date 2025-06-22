
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";

export default function AboutUsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-card p-8 md:p-12 rounded-lg shadow-xl">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-8 text-center">
            About Usha Metals & Agency
          </h1>

          <section className="mb-12">
            <h2 className="text-3xl font-headline text-accent mb-4">Our Mission</h2>
            <p className="text-lg font-body text-foreground/90 leading-relaxed">
              Our mission is to be the leading wholesale and retail supplier of quality household goods. We are dedicated to providing a vast selection of products at reasonable prices for our retail customers while being a steadfast partner to small dealers, supporting their growth and success.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-headline text-accent mb-4">Our Story</h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-lg font-body text-foreground/90 leading-relaxed mb-4">
                  Founded in 1960, Usha Metals & Agency has grown from a humble beginning into a cornerstone of the community for household necessities. For over six decades, we have built a legacy of trust, supplying everything from traditional aluminum, stainless steel, and brass vessels to modern small appliances and elegant crockery.
                </p>
                <p className="text-lg font-body text-foreground/90 leading-relaxed">
                  Our journey has been one of continuous adaptation and commitment to our customers. We pride ourselves on understanding the needs of both individual households and small businesses, offering a diverse inventory that includes cookware, glassware, and unique presentation articles, ensuring quality and value in every item.
                </p>
              </div>
              <div className="relative aspect-video rounded-lg overflow-hidden shadow-md">
                <Image
                  src="https://placehold.co/600x400.png"
                  alt="Our Store or Products"
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint="store interior"
                />
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-headline text-accent mb-4">Our Values</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Legacy & Trust", description: "Serving our community with reliability and integrity since 1960." },
                { title: "Quality & Variety", description: "Offering a wide range of durable, high-quality household goods." },
                { title: "Fair Pricing", description: "Providing reasonable and transparent prices for all customers." },
                { title: "Dealer Partnership", description: "Committing to the success and growth of our small dealer network." },
                { title: "Customer Focus", description: "Prioritizing the diverse needs of both retail and wholesale clients." },
                { title: "Integrity", description: "Operating our business with honesty and strong ethical principles." },
              ].map((value) => (
                <div key={value.title} className="bg-background p-6 rounded-md shadow">
                  <h3 className="text-xl font-headline text-primary mb-2">{value.title}</h3>
                  <p className="font-body text-foreground/80">{value.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-headline text-accent mb-6 text-center">Meet The Team</h2>
            <p className="text-lg font-body text-foreground/90 leading-relaxed text-center">
              As a long-standing establishment, our strength comes from the dedicated team that has been with us through the years. While we're preparing for a proper photoshoot, rest assured a passionate group of sourcing experts, sales associates, and support staff are working behind the scenes to bring you the best products and service.
            </p>
            <div className="mt-6 flex justify-center">
               <Image
                  src="https://placehold.co/800x300.png"
                  alt="Placeholder for Team Photo / Collage"
                  width={800}
                  height={300}
                  className="rounded-lg shadow-md object-cover"
                  data-ai-hint="team portrait"
                />
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
