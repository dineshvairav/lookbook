
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-card p-8 md:p-12 rounded-lg shadow-xl prose prose-lg dark:prose-invert max-w-none font-body">
          <h1 className="font-headline text-primary !mb-8 text-center">Terms of Service</h1>
          <p className="text-muted-foreground text-center !-mt-6 !mb-10">Last Updated: {new Date().toLocaleDateString()}</p>

          <h2 className="font-headline">1. Agreement to Terms</h2>
          <p>
            These Terms of Service constitute a legally binding agreement made between you,
            whether personally or on behalf of an entity (“you”) and Lookbook
            (“we,” “us” or “our”), concerning your access to and use of the
            [Your Website URL] website as well as any other media form, media channel,
            mobile website or mobile application related, linked, or otherwise connected
            thereto (collectively, the “Site” or "Services").
          </p>
          <p>
            You agree that by accessing the Site, you have read, understood, and agree to
            be bound by all of these Terms of Service. If you do not agree with all of
            these Terms of Service, then you are expressly prohibited from using the Site
            and you must discontinue use immediately.
          </p>

          <h2 className="font-headline">2. Intellectual Property Rights</h2>
          <p>
            Unless otherwise indicated, the Site is our proprietary property and all source
            code, databases, functionality, software, website designs, audio, video, text,
            photographs, and graphics on the Site (collectively, the “Content”) and the
            trademarks, service marks, and logos contained therein (the “Marks”) are owned
            or controlled by us or licensed to us, and are protected by copyright and
            trademark laws and various other intellectual property rights.
          </p>

          <h2 className="font-headline">3. User Representations</h2>
          <p>
            By using the Site, you represent and warrant that: (1) all registration
            information you submit will be true, accurate, current, and complete; (2) you
            will maintain the accuracy of such information and promptly update such
            registration information as necessary; (3) you have the legal capacity and you
            agree to comply with these Terms of Service; (4) you are not a minor in the
            jurisdiction in which you reside, or if a minor, you have received parental
            permission to use the Site.
          </p>

          <h2 className="font-headline">4. User Registration</h2>
          <p>
            You may be required to register with the Site. You agree to keep your password
            confidential and will be responsible for all use of your account and password.
            We reserve the right to remove, reclaim, or change a username you select if we
            determine, in our sole discretion, that such username is inappropriate, obscene,
            or otherwise objectionable.
          </p>

          <h2 className="font-headline">5. Prohibited Activities</h2>
          <p>
            You may not access or use the Site for any purpose other than that for which we
            make the Site available. The Site may not be used in connection with any
            commercial endeavors except those that are specifically endorsed or approved by us.
          </p>
          <p>As a user of the Site, you agree not to: [List a few prohibited activities relevant to an e-commerce/lookbook app, e.g., systematic data scraping, unauthorized framing, interfering with security features, etc.]</p>

          <h2 className="font-headline">6. Purchases and Payment</h2>
          <p>
            We accept the following forms of payment: [Visa, Mastercard, American Express, PayPal - Adjust as needed].
            You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Site. Sales tax will be added to the price of purchases as required by law. All payments shall be in [Your Currency, e.g., USD, INR].
          </p>
          
          <h2 className="font-headline">7. Return/Refund Policy</h2>
          <p>
            Please review our Return Policy posted on the Site prior to making any purchases.
            (Note: A separate Return Policy page would typically exist). For now, we can say: All sales are final/Please contact customer service for returns.
          </p>

          <h2 className="font-headline">8. Term and Termination</h2>
          <p>
            These Terms of Service shall remain in full force and effect while you use the
            Site. WITHOUT LIMITING ANY OTHER PROVISION OF THESE TERMS OF SERVICE, WE RESERVE
            THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY
            ACCESS TO AND USE OF THE SITE (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY
            PERSON FOR ANY REASON OR FOR NO REASON.
          </p>

          <h2 className="font-headline">9. Modifications and Interruptions</h2>
          <p>
            We reserve the right to change, modify, or remove the contents of the Site at
            any time or for any reason at our sole discretion without notice. We also
            reserve the right to modify or discontinue all or part of the Site without
            notice at any time.
          </p>

          <h2 className="font-headline">10. Governing Law</h2>
          <p>
            These Terms of Service and your use of the Site are governed by and construed
            in accordance with the laws of [Your State/Country] applicable to agreements
            made and to be entirely performed within [Your State/Country], without regard
            to its conflict of law principles.
          </p>
          
          <h2 className="font-headline">11. Disclaimer</h2>
          <p>
           THE SITE IS PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SITE AND OUR SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SITE AND YOUR USE THEREOF, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>

          <h2 className="font-headline">12. Limitation of Liability</h2>
          <p>
            IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES... ARISING FROM YOUR USE OF THE SITE.
          </p>

          <h2 className="font-headline">13. Contact Us</h2>
          <p>
            In order to resolve a complaint regarding the Site or to receive further
            information regarding use of the Site, please contact us at:
          </p>
          <p>
            Lookbook
            <br />
            [Your Company Address Line 1]
            <br />
            [Your Company Address Line 2]
            <br />
            [City, State, Postal Code]
            <br />
            [Country]
            <br />
            support@lookbook.com
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
