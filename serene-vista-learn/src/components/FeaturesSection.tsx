
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AudioWaveform, ListCheck, BookOpen, Route } from "lucide-react";

const features = [
  {
    icon: <AudioWaveform className="feature-icon" />,
    title: "Speech Shadow",
    description: "Compare your pronunciation with native speakers in real-time and receive instant feedback on your accuracy.",
  },
  {
    icon: <ListCheck className="feature-icon" />,
    title: "Vocab Quiz",
    description: "Test and expand your vocabulary with spaced repetition flashcards tailored to your learning goals.",
  },
  {
    icon: <BookOpen className="feature-icon" />,
    title: "Grammar Quiz",
    description: "Master grammar rules through interactive exercises with contextual examples and explanations.",
  },
  {
    icon: <Route className="feature-icon" />,
    title: "Custom Learning Paths",
    description: "Follow personalized learning journeys based on your proficiency level, goals, and interests.",
  },
];

const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Learning Tools</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
          Our comprehensive suite of language learning tools helps you master all aspects of language acquisition
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow group">
              <CardContent className="p-6 text-center flex flex-col items-center">
                <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
