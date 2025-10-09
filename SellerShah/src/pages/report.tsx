import Navbar from "../components/custom/Navbar/navbar";
import Footer from "../components/custom/footer";
import { AppSidebar } from "@/components/custom/sidebar";
import { useState } from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const faqs = [
  {
    id: "faq1",
    question: "How do I add a new product?",
    answer: "Go to the Products page and click 'Add New Product'. Fill in the details and save."
  },
  {
    id: "faq2",
    question: "How do I track my orders?",
    answer: "Go to the Orders page to see all your orders and their statuses."
  },
  {
    id: "faq3",
    question: "How do I contact support?",
    answer: "Use the email form below to reach out to our support team."
  },
];


export default function ReportPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setEmail("");
    setMessage("");
    // Here you would send the email to support
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex">
        <AppSidebar />
        <div className="flex-1 py-8 px-2 md:px-8">
          <div className="max-w-2xl mx-auto mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-1">FAQ & Report</h1>
            <p className="text-gray-500 mb-6">Frequently Asked Questions and Contact Support</p>
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-indigo-700">FAQs</h2>
              <div className="space-y-4">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, idx) => (
                    <AccordionItem key={faq.id} value={faq.id}>
                      <AccordionTrigger className="transition-opacity duration-200 hover:no-underline hover:opacity-60 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-lg">
                        <div className="font-semibold text-indigo-800 mb-1">
                          {faq.question}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="sm:mb-1 lg:mb-2">
                        <div className="text-gray-600">
                          {faq.answer}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-2 text-indigo-700">Contact Support</h2>
              <p className="text-gray-600 mb-4">If you have any questions or need assistance, please send us a message via email (shahmarketplaceofficial@gmail.com).</p>

              <p>
                What to include in your message:
                <ul className="list-disc list-inside mt-2 text-gray-600">
                  <li>A clear description of your issue or question.</li>
                  <li>Any relevant order or product details.</li>
                  <li>Your contact information for follow-up.</li>
                </ul>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}