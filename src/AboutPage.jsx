import React from "react";
import "./about.css";
import watermark from "./images/watermark.svg";
import aboutHero from "./images/family.jpg";
import { Link } from "react-router-dom";

export default function AboutPage() {
  const isLoggedIn = Boolean(localStorage.getItem("token")); 

  return (
    <div className="about-page">
      <header className="navbar">
        <div className="nav-inner">
          <div className="logo">
            Adventure <span>GO</span>
          </div>

          <nav className="nav-links">
            <Link to="/main">Home</Link>
            <Link to="/about">About us</Link>
            <Link to="/contact">Contact</Link>
          </nav>

          
          <div className="nav-actions">
            {isLoggedIn ? (
              <Link to="/account" className="login">
                Account
              </Link>
            ) : (
              <>
                <Link to="/login" className="login">
                  Login
                </Link>
                <Link to="/signup" className="signup">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="about-hero">
        <img className="about-hero-img" src={aboutHero} alt="" />
        <div className="about-hero-overlay">
          <h1>About us</h1>
          <p>
            A place to remember where you’ve been, where you
            <br />
            are, and where you’re going.
          </p>
        </div>
      </section>

      <section className="about-content">
        <h2>Our Motivation</h2>

        <div className="about-body">
          <p>
            Adventures often pass by faster than we expect. Days blur together,
            details fade, and meaningful moments are easily lost to time. Our
            motivation comes from the desire to slow those moments down and give
            them a place to live on.
          </p>

          <p>
            We wanted to create a space where experiences aren’t just remembered
            vaguely, but captured clearly – by date, by place, and by feeling. A
            platform that helps people look back and say{" "}
            <strong>
              “This is where I was, this is what I did, and this is how it
              felt.”
            </strong>
          </p>

          <p>
            At its core, Adventure GO exists to turn fleeting experiences into
            lasting memories, making it easier to reflect, reconnect, and
            appreciate the journeys that shape us.
          </p>
        </div>
      </section>

      <footer className="footer">
        <img
          className="footer-watermark"
          src={watermark}
          alt=""
          aria-hidden="true"
        />

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
            <Link to="/about">About us</Link>
          </div>

          <div className="footer-col">
            <h4>Support</h4>
            <Link to="/contact">Contact us</Link>
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
