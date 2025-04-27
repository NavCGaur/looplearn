
import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Basic",
    price: "Free",
    description: "Perfect for casual learners",
    features: [
      "Basic vocabulary quizzes",
      "Limited grammar exercises",
      "1 language",
      "Community forums access"
    ],
    isPopular: false,
    buttonText: "Get Started",
    buttonVariant: "outline"
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "per month",
    description: "Ideal for serious language learners",
    features: [
      "All Basic features",
      "Full Speech Shadow tool",
      "Advanced grammar & vocabulary",
      "3 languages",
      "Personalized learning paths",
      "Progress tracking"
    ],
    isPopular: true,
    buttonText: "Start 7-Day Free Trial",
    buttonVariant: "default"
  },
  {
    name: "Premium",
    price: "$19.99",
    period: "per month",
    description: "For language learning enthusiasts",
    features: [
      "All Pro features",
      "Unlimited languages",
      "1-on-1 tutor sessions",
      "Pronunciation analysis",
      "Offline mode",
      "Priority support"
    ],
    isPopular: false,
    buttonText: "Start 7-Day Free Trial",
    buttonVariant: "outline"
  }
];

const PricingSection: React.FC = () => {
  return (
    <section id="pricing" className="py-20 px-6 bg-blue-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan to match your language learning goals and budget
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-xl shadow-lg border ${
                plan.isPopular ? 'border-langlearn-blue ring-2 ring-langlearn-blue ring-opacity-50' : 'border-gray-100'
              } p-8 flex flex-col relative`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-langlearn-blue text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-gray-500 ml-2">{plan.period}</span>}
              </div>
              <p className="text-gray-600 mb-6">{plan.description}</p>
              
              <div className="flex-grow">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="h-5 w-5 text-langlearn-blue shrink-0 mr-2" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Button 
                className={`w-full ${plan.buttonVariant === "default" ? "bg-langlearn-blue hover:bg-langlearn-dark-blue" : ""}`}
                variant={plan.buttonVariant as "outline" | "default"}
              >
                {plan.buttonText}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
