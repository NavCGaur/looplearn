
import React from "react";
import { Button } from "@/components/ui/button";

const CallToActionSection: React.FC = () => {
  return (
    <section className="py-20 px-6 bg-gradient-to-br from-langlearn-blue/20 to-langlearn-light-blue/10">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Language Learning?</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Join thousands of learners who have accelerated their language proficiency with our innovative tools and personalized approach
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button className="bg-langlearn-blue hover:bg-langlearn-dark-blue text-white px-8 py-6 text-lg">
            Start Free Trial
          </Button>
          <Button variant="outline" className="px-8 py-6 text-lg">
            View Demo
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;
