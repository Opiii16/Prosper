import React from 'react';
import './AboutUs.css';

const AboutUs = () => {
    return (
        <div className="about-us-container">
            <div className="about-us-content">
                {/* Replace with your actual logo path */}
                <img 
                    src="/assets/images/prosper-logo.png"
                    alt="Prosper Clothing Logo" 
                    className="prosper-logo"
                />
                
                <h1 className="about-us-title">Our Story</h1>
                
                <div className="about-us-description">
                    <p>
                        At Prosper, we believe fashion should empower you to express your best self. 
                        Founded in 2023, our brand was born from a passion for quality craftsmanship 
                        and timeless style that transcends seasons. We create clothing that helps you 
                        look prosperous while feeling comfortable in your own skin.
                    </p>
                    
                    <p>
                        What began as a small design studio has grown into a respected fashion brand 
                        known for its attention to detail and commitment to sustainable practices. 
                        We combine premium fabrics with contemporary designs to create pieces that 
                        elevate your everyday wardrobe.
                    </p>
                    
                    <p>
                        Our name "Prosper" reflects our philosophy. We design clothing that helps 
                        you project confidence and success, whether you're dressing for the boardroom, 
                        a night out, or casual weekends. Each piece is crafted to become a staple 
                        in your wardrobe for years to come.
                    </p>
                    
                    <p>
                        What sets us apart is our dedication to ethical production and inclusive sizing. 
                        We don't just follow trends; we create wearable art that celebrates all body types. 
                        Our collections are designed to mix and match, giving you endless possibilities 
                        to express your personal style.
                    </p>
                    
                    <p>
                        As we grow, our values remain constant: quality, sustainability, and self-expression. 
                        We're proud to have dressed thousands of customers who appreciate clothing that 
                        makes them look and feel their best. Join us on this journey as we redefine what 
                        it means to dress for success.
                    </p>
                </div>
                
                <div className="mission-vision">
                    <div className="mission">
                        <h3>Our Mission</h3>
                        <p>
                            To create high-quality, sustainable fashion that empowers individuals 
                            to express their unique style and confidence through clothing designed 
                            to last.
                        </p>
                    </div>
                    
                    <div className="vision">
                        <h3>Our Vision</h3>
                        <p>
                            A world where fashion is both beautiful and responsible, where everyone 
                            can find clothing that makes them feel prosperous in their own skin.
                        </p>
                    </div>
                </div>
                
                <div className="core-values">
                    <h3>Our Core Values</h3>
                    <ul>
                        <li><strong>Quality Craftsmanship:</strong> We take pride in every stitch and seam</li>
                        <li><strong>Sustainable Practices:</strong> We prioritize eco-friendly materials and processes</li>
                        <li><strong>Inclusivity:</strong> We design for all body types and personal styles</li>
                        <li><strong>Timeless Design:</strong> We create pieces that transcend seasonal trends</li>
                        <li><strong>Customer Joy:</strong> We measure success by how our clothing makes you feel</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;