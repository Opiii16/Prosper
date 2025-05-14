import React from 'react'

const Footer = () => {
  return (
    <div>
      <footer className="prosper-footer bg-dark text-white pt-4 pb-2">
  <div className="container">
    <div className="row text-center text-md-start">
      {/* Brand Info */}
      <div className="col-md-4 mb-3">
        <img
          src="/assets/images/prosper-logo.png"
          alt="Prosper Clothing Logo"
          className="img-fluid mb-2"
          style={{ maxWidth: '100px' }}
        />
        <p className="mb-1 fw-bold">PROSPER CLOTHING</p>
        <p style={{ fontSize: '0.85rem' }}>
          Premium fashion for the bold and stylish. Elevate your wardrobe with our latest collections.
        </p>
      </div>

      {/* Newsletter Signup */}
      <div className="col-md-4 mb-3">
        <h6 className="fw-bold mb-2">Join Our Newsletter</h6>
        <form>
          <input
            type="email"
            className="form-control form-control-sm mb-2"
            placeholder="Your email"
          />
          <button type="submit" className="btn btn-outline-light btn-sm w-100">
            Subscribe for Updates
          </button>
        </form>
        <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
          Get exclusive discounts & early access to new drops.
        </p>
      </div>

      {/* Contact & Socials */}
      <div className="col-md-4 mb-3">
        <h6 className="fw-bold mb-2">Connect With Us</h6>
        <p style={{ fontSize: '0.85rem', marginBottom: '0.3rem' }}>
          <strong>Email:</strong> hello@prosperclothing.com
        </p>
        <p style={{ fontSize: '0.85rem', marginBottom: '0.3rem' }}>
          <strong>Returns/Support:</strong> support@prosperclothing.com
        </p>
        <div className="d-flex justify-content-center justify-content-md-start gap-3 mt-2">
          <a href="#" className="text-white">
            <img src="/assets/images/instagram.png" alt="Instagram" height="24" />
          </a>
          <a href="#" className="text-white">
            <img src="/assets/images/facebook.png" alt="Facebook" height="24" />
          </a>
          <a href="#" className="text-white">
            <img src="/assets/images/tiktok.png" alt="TikTok" height="24" />
          </a>
        </div>
      </div>
    </div>

    {/* Copyright */}
    <div className="text-center mt-3 border-top pt-2" style={{ fontSize: '0.75rem' }}>
      <img
        src="/assets/images/prosper-icon.png"
        alt="Prosper Icon"
        height="20"
        className="me-2"
      />
      © {new Date().getFullYear()} Prosper Clothing. All rights reserved.
      <img
        src="/assets/images/prosper-icon.png"
        alt="Prosper Icon"
        height="20"
        className="ms-2"
      />
    </div>
  </div>
</footer>
    </div>
  )
}

export default Footer
