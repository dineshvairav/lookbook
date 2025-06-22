
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const address = "Usha Metals & Appliances, Fancy Bazaar, Changanacherry, 686101";
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <footer className="border-t border-border/40 mt-auto bg-card text-card-foreground font-body">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold font-headline text-primary">Contact Us</h3>
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">
                  <a 
                    href={googleMapsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-primary transition-colors"
                  >
                    {address}
                  </a>
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">
                  <a href="mailto:ushaagency1960@gmail.com" className="hover:text-primary transition-colors">
                    info@usha1960.trade
                  </a>
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">
                  <a href="tel:+919961295835" className="hover:text-primary transition-colors">
                    +91 (9961) 295-835
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold font-headline text-primary">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/shop" className="text-muted-foreground hover:text-primary transition-colors">Shop</Link></li>
              <li><Link href="/wishlist" className="text-muted-foreground hover:text-primary transition-colors">Wishlist</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold font-headline text-primary">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} ushªOªpp. All rights reserved.</p>
          <p>Designed with <a href="https://firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary transition-colors">Firebase AI Studio</a>.</p>
        </div>
      </div>
    </footer>
  );
}
