// Import React
import React from 'react';
// Import styles
import './About.css';

// About component
function About() {
  const features = [
    {
      title: "Unique Identification",
      description: "Get your unique NFT that reflects your true essence based on your test answers.",
      icon: (
        <svg className="feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 15C15.3137 15 18 12.3137 18 9C18 5.68629 15.3137 3 12 3C8.68629 3 6 5.68629 6 9C6 12.3137 8.68629 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 20.25C3 17.3505 7.02944 15 12 15C16.9706 15 21 17.3505 21 20.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      title: "AI Analysis",
      description: "Our advanced AI analyzes your answers and creates a personalized description of your digital essence.",
      icon: (
        <svg className="feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    {
      title: "Blockchain Technology",
      description: "Your NFT is securely stored on the Polygon blockchain, ensuring security and transparency.",
      icon: (
        <svg className="feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ];

  return (
    <section className="about">
      <div className="about-content">
        <h2 className="about-title">About Project</h2>
        <p className="about-description">
          We've combined artificial intelligence and blockchain technologies to create a unique self-discovery experience. 
          Take our test, get your unique NFT, and become part of the new digital era.
        </p>
        
        <div className="about-features">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              {feature.icon}
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Export component
export default About; 