
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
            About ushªOªpp
          </h1>

          <section className="mb-12">
            <h2 className="text-3xl font-headline text-accent mb-4">Our Mission</h2>
            <p className="text-lg font-body text-foreground/90 leading-relaxed">
              At ushªOªpp, our mission is to empower individuals to express their unique style
              and confidence through curated fashion. We believe that clothing is more than
              just fabric; it's a form of self-expression, art, and identity. We strive to
              bring you diverse collections that inspire and delight.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-headline text-accent mb-4">Our Story</h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-lg font-body text-foreground/90 leading-relaxed mb-4">
                  Founded in [1960], Lookbook started as a small passion project by a group of
                  fashion enthusiasts who wanted to create a platform that celebrated individuality
                  and timeless style. We noticed a gap in the market for a curated space that
                  offered not just products, but inspiration and a sense of community.
                </p>
                <p className="text-lg font-body text-foreground/90 leading-relaxed">
                  Over the years, we've grown into a beloved destination for those seeking
                  high-quality, stylish pieces that tell a story. Our commitment to ethical
                  sourcing, customer satisfaction, and staying ahead of trends (while honoring classics)
                  remains at the heart of everything we do.
                </p>
              </div>
              <div className="relative aspect-video rounded-lg overflow-hidden shadow-md">
                <Image
                  src="https://placehold.co/600x400.png"
                  alt="Our Team or Brand Story"
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint="team fashion"
                />
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-headline text-accent mb-4">Our Values</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Individuality", description: "Celebrating unique styles and personal expression." },
                { title: "Quality", description: "Offering well-crafted, durable, and beautiful pieces." },
                { title: "Inspiration", description: "Curating collections that spark creativity and confidence." },
                { title: "Community", description: "Fostering a welcoming space for fashion lovers." },
                { title: "Integrity", description: "Operating ethically and transparently in all we do." },
                { title: "Customer Focus", description: "Prioritizing the needs and satisfaction of our customers." },
              ].map((value) => (
                <div key={value.title} className="bg-background p-6 rounded-md shadow">
                  <h3 className="text-xl font-headline text-primary mb-2">{value.title}</h3>
                  <p className="font-body text-foreground/80">{value.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-headline text-accent mb-6 text-center">Meet The (Placeholder) Team</h2>
            <p className="text-lg font-body text-foreground/90 leading-relaxed text-center">
              While we're a passionate and growing team, we're a bit camera shy for now!
              Rest assured, a dedicated group of fashion curators, tech wizards, and customer
              support heroes are working behind the scenes to bring you the best ushªOªpp experience.
            </p>
            <div className="mt-6 flex justify-center">
               <Image
                  src="https://placehold.co/800x300.png"
                  alt="Placeholder for Team Photo / Collage"
                  width={800}
                  height={300}
                  className="rounded-lg shadow-md object-cover"
                  data-ai-hint="team abstract"
                />
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
