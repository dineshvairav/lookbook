
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-card p-8 md:p-12 rounded-lg shadow-xl prose prose-lg dark:prose-invert max-w-none font-body">
          <h1 className="font-headline text-primary !mb-8 text-center">Privacy Policy</h1>
          <p className="text-muted-foreground text-center !-mt-6 !mb-10">Last Updated: {new Date().toLocaleDateString()}</p>

          <h2 className="font-headline">1. Introduction</h2>
          <p>
            Welcome to ushªOªpp ("we," "our," or "us"). We are committed to protecting your
            personal information and your right to privacy. If you have any questions or
            concerns about this privacy notice, or our practices with regards to your
            personal information, please contact us at info@usha1960.trade.
          </p>
          <p>
            This privacy notice describes how we might use your information if you:
            Visit our website at usha1960.trade, download and use our mobile application,
            or engage with us in other related ways ― including any sales, marketing, or events.
            In this privacy notice, if we refer to: "Website," we are referring to any website of
            ours that references or links to this policy; "App," we are referring to any application
            of ours that references or links to this policy; "Services," we are referring to our
            Website, App, and other related services, including any sales, marketing, or events.
          </p>

          <h2 className="font-headline">2. Information We Collect</h2>
          <p>
            We collect personal information that you voluntarily provide to us when you
            register on the Services, express an interest in obtaining information about us
            or our products and Services, when you participate in activities on the
            Services or otherwise when you contact us.
          </p>
          <p>
            The personal information that we collect depends on the context of your
            interactions with us and the Services, the choices you make and the products
            and features you use. The personal information we collect may include the following:
            Name and Contact Data, Credentials, Payment Data (handled by third-party processors).
          </p>

          <h2 className="font-headline">3. How We Use Your Information</h2>
          <p>
            We use personal information collected via our Services for a variety of business
            purposes described below. We process your personal information for these
            purposes in reliance on our legitimate business interests, in order to enter
            into or perform a contract with you, with your consent, and/or for compliance
            with our legal obligations.
          </p>
          <ul className="list-disc pl-6">
            <li>To facilitate account creation and logon process.</li>
            <li>To post testimonials (with your consent).</li>
            <li>Request feedback.</li>
            <li>To enable user-to-user communications.</li>
            <li>To manage user accounts.</li>
            <li>To send administrative information to you.</li>
            <li>To protect our Services.</li>
            <li>To enforce our terms, conditions and policies for business purposes, to comply with legal and regulatory requirements or in connection with our contract.</li>
            <li>To respond to legal requests and prevent harm.</li>
          </ul>

          <h2 className="font-headline">4. Will Your Information Be Shared With Anyone?</h2>
          <p>
            We only share information with your consent, to comply with laws, to provide you
            with services, to protect your rights, or to fulfill business obligations. We may
            process or share your data that we hold based on the following legal basis:
            Consent, Legitimate Interests, Performance of a Contract, Legal Obligations, Vital Interests.
          </p>

          <h2 className="font-headline">5. Cookies and Tracking Technologies</h2>
          <p>
            We may use cookies and similar tracking technologies (like web beacons and pixels)
            to access or store information. Specific information about how we use such
            technologies and how you can refuse certain cookies is set out in our Cookie Notice (if applicable).
          </p>
          
          <h2 className="font-headline">6. How Long Do We Keep Your Information?</h2>
          <p>
            We will only keep your personal information for as long as it is necessary for the
            purposes set out in this privacy notice, unless a longer retention period is required
            or permitted by law (such as tax, accounting or other legal requirements).
          </p>

          <h2 className="font-headline">7. How Do We Keep Your Information Safe?</h2>
          <p>
            We have implemented appropriate technical and organizational security measures
            designed to protect the security of any personal information we process. However,
            despite our safeguards and efforts to secure your information, no electronic
            transmission over the Internet or information storage technology can be guaranteed
            to be 100% secure.
          </p>

          <h2 className="font-headline">8. What Are Your Privacy Rights?</h2>
          <p>
            In some regions (like the EEA, UK, and Canada), you have certain rights under
            applicable data protection laws. These may include the right (i) to request access
            and obtain a copy of your personal information, (ii) to request rectification or
            erasure; (iii) to restrict the processing of your personal information; and
            (iv) if applicable, to data portability. In certain circumstances, you may also
            have the right to object to the processing of your personal information.
          </p>

          <h2 className="font-headline">9. Updates to This Notice</h2>
          <p>
            We may update this privacy notice from time to time. The updated version will be
            indicated by an updated "Revised" date and the updated version will be effective
            as soon as it is accessible. We encourage you to review this privacy notice
            frequently to be informed of how we are protecting your information.
          </p>

          <h2 className="font-headline">10. How Can You Contact Us About This Notice?</h2>
          <p>
            If you have questions or comments about this notice, you may email us at
            info@usha1960.trade or by post to:
          </p>
          <p>
            Usha Metals & Agency
            <br />
            Fancy Bazaar
            <br />
            Changanacherry, Kerala, 686101
            <br />
            INDIA
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
