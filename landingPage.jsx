import React from "react";
import "./landing.css";
import travelIcon from "./images/travels.png";
import phoneIcon from "./images/phone.png";
import businessIcon from "./images/business.png";
import heroImage from "./images/hiking.jpg";
import watermark from "./images/watermark.svg"; 

export default function LandingPage() {
  return (
    <div className="page">
      <header className="navbar">
        <div className="nav-inner">
          <div className="logo">
            Adventure <span>GO</span>
          </div>
          <nav className="nav-links">
            <a href="#">Home</a>
            <a href="#">About us</a>
            <a href="#">Contact</a>
          </nav>
          <div className="nav-actions">
            <a href="#" className="login">Login</a>
            <button className="signup">Sign up</button>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-overlay">
          <h1>Turn every journey into a<br />story</h1>
          <p>Log Adventures, relive experiences and keep your memories sealed.</p>
          <button className="cta">Get Started</button>
        </div>
      </section>

      <section className="info">
        <h2>What is Adventure<br />Go?</h2>
        <p className="subtitle">
          Adventure Go is your go-to adventure log tool.<br />
          You can easily create your own album that seals all of your favourite adventures.
        </p>

        <div className="features">
          <div className="feature">
            <img src={travelIcon} alt="Map icon" className="icon" />

            <p>Pinpoint where you’ve been, where you are or where you’re headed using our map.</p>
          </div>
          <div className="feature">
            <img src={phoneIcon} alt="Camera icon" className="icon" />
            <p>Bring your story to life – upload your favourite photos and tell the story behind them.</p>
          </div>
          <div className="feature">
            <img src={businessIcon} alt="Business icon" className="icon" />
            <p>Access all of your memories on your mobile device.</p>
          </div>
        </div>

        <button className="cta dark">Get Started</button>
      </section>

      <footer className="footer">
  
 


<img className="footer-watermark" src={watermark} alt="" aria-hidden="true" />


  <div className="footer-inner">
    <div className="footer-brand">
      <h3>Adventure GO</h3>
      <p>
        Where every journey becomes a chapter in your story. Record your
        adventures and revisit the moments that matter.
      </p>
      <p className="footer-copy">©2025 Adventure Go. All rights reserved.</p>
    </div>

    <div className="footer-col">
      <h4>About</h4>
      <a href="#">About us</a>
    </div>

    <div className="footer-col">
      <h4>Support</h4>
      <a href="#">Contact us</a>
    </div>

    <div className="footer-subscribe">
      <h4>Get updates</h4>
      <div className="subscribe">
        <input placeholder="Enter your email" />
        <button>Subscribe</button>
      </div>
    </div>
  </div>
</footer>

    </div>
  );
}
