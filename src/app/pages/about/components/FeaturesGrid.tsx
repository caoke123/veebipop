import React from 'react';

const FeaturesGrid: React.FC = () => {
  const features = [
    {
      id: 1,
      title: "Original Manufacturer",
      description: "Direct from our workshop — 100% authentic, no middlemen, best price guaranteed. We control quality from raw material to final packaging."
    },
    {
      id: 2,
      title: "Trend-Driven Design",
      description: "Our 15-person design team tracks global trends daily. We launch new, market-ready designs every 7-15 days to keep you ahead of the curve."
    },
    {
      id: 3,
      title: "Premium Quality",
      description: "Hand-stitched details using premium plush materials. All products meet strict CE, ASTM, and CPSIA safety standards for global markets."
    },
    {
      id: 4,
      title: "Wholesale Pricing",
      description: "Factory-direct pricing that is 30-50% lower than trading companies, maximizing your profit margins without compromising quality."
    },
    {
      id: 5,
      title: "Full Customization",
      description: "End-to-end OEM/ODM services. From initial sketch to shelf-ready product, we handle your logo, custom packaging, and IP development."
    },
    {
      id: 6,
      title: "Global Supply Chain",
      description: "With a capacity of 500,000+ pcs/month and efficient logistics, we offer FOB Shenzhen in 15-25 days and door-to-door delivery to 50+ countries."
    }
  ];

  return (
    <section className="py-24 bg-surface">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="heading2 text-black mb-4">Why Choose Us</h2>
          <p className="body1 text-secondary max-w-2xl mx-auto">
            We combine reliability of a large-scale manufacturer with agility of a design studio.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.id} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 border border-line group">
              <div className="w-14 h-14 bg-green/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-green transition-colors duration-300">
                <div className="w-7 h-7 bg-green rounded-full group-hover:bg-white transition-colors duration-300"></div>
              </div>
              <h3 className="heading5 text-black mb-3">{feature.title}</h3>
              <p className="body1 text-secondary leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;