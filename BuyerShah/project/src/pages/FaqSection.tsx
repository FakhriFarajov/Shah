import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import React from "react";

interface Faq {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  faqs: Faq[];
}

const FaqSection: React.FC<FaqSectionProps> = ({ faqs }) => {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Frequently Asked Questions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border-b pb-2">
              <div className="font-semibold">{faq.question}</div>
              <div className="mt-1 text-gray-700">{faq.answer}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FaqSection;
