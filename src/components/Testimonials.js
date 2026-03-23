import React from 'react';
import './Testimonials.css';

function Testimonials() {
  const testimonials = [
    {
      name: "Alexander",
      avatar: "😎",
      role: "Developer",
      text: "Finally, I found out that I'm a battle toaster! Now my life has meaning. The best test I've ever taken!",
      nft: "Battle Toaster #420"
    },
    {
      name: "Maria",
      avatar: "🎨",
      role: "Designer",
      text: "Turns out I'm a meditating donut. That explains my love for zen and sweets. The NFT is just incredible!",
      nft: "Meditating Donut #69"
    },
    {
      name: "Dennis",
      avatar: "🚀",
      role: "Entrepreneur",
      text: "At first I thought it was a joke, but when I got my 'Space Banana' NFT, I realized - this is destiny!",
      nft: "Space Banana #777"
    }
  ];

  return (
    <section className="testimonials">
      <div className="testimonials-content">
        <h2 className="testimonials-title">
          WHAT <span className="highlight">HAPPY NFT OWNERS</span> SAY
        </h2>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div className="testimonial-card" key={index}>
              <div className="testimonial-header">
                <div className="testimonial-avatar">{testimonial.avatar}</div>
                <div className="testimonial-info">
                  <h3>{testimonial.name}</h3>
                  <p className="role">{testimonial.role}</p>
                </div>
              </div>
              
              <div className="testimonial-body">
                <p className="testimonial-text">{testimonial.text}</p>
              </div>
              
              <div className="testimonial-footer">
                <div className="nft-badge">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="nft-icon">
                    <path d="M21 8V16C21 18.7614 18.7614 21 16 21H8C5.23858 21 3 18.7614 3 16V8C3 5.23858 5.23858 3 8 3H16C18.7614 3 21 5.23858 21 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 15L10 12L13 15L17 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{testimonial.nft}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials; 