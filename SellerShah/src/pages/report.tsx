import Navbar from "../components/custom/Navbar/navbar";
import Footer from "../components/custom/footer";
import { AppSidebar } from "@/components/custom/sidebar";
import { useState } from "react";

const faqs = [
  {
    question: "How do I add a new product?",
    answer: "Go to the Products page and click 'Add New Product'. Fill in the details and save."
  },
  {
    question: "How do I track my orders?",
    answer: "Go to the Orders page to see all your orders and their statuses."
  },
  {
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
                {faqs.map((faq, idx) => (
                  <div key={idx} className="bg-white rounded-lg shadow p-4">
                    <div className="font-semibold text-indigo-800 mb-1">{faq.question}</div>
                    <div className="text-gray-600">{faq.answer}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-2 text-indigo-700">Contact Support</h2>
              <form onSubmit={handleSend} className="space-y-4">
                <input
                  type="email"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <textarea
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Your message"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={4}
                  required
                />
                <button
                  type="submit"
                  className="w-full py-3 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow mt-2"
                  disabled={sent}
                >
                  {sent ? "Message Sent!" : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
