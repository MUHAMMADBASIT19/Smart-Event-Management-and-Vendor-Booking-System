import { useEffect, useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store } from "../Store";
import "./LandingScreen.css";
import {
  FiSearch, FiMessageCircle, FiTrendingUp, FiMapPin, FiShield,
  FiStar, FiCheckCircle, FiArrowRight, FiLock, FiUsers,
  FiCalendar, FiMic, FiGift, FiActivity, FiZap,
  FiBriefcase, FiAward, FiHeart,
} from "react-icons/fi";

const features = [
  { icon: FiSearch,        title: "Discover Events",       desc: "Browse thousands of curated venues and events — from intimate gatherings to grand celebrations." },
  { icon: FiMessageCircle, title: "Real-Time Messaging",   desc: "Chat directly with vendors and coordinators via our built-in live messaging system." },
  { icon: FiTrendingUp,    title: "Live Bidding",          desc: "Get the best deal with our transparent, real-time bidding system for event packages." },
  { icon: FiMapPin,        title: "Location Search",       desc: "Find events near you using smart location-based search powered by geolocation." },
  { icon: FiShield,        title: "Secure Payments",       desc: "Pay confidently with PayPal integration — fully encrypted and buyer-protected." },
  { icon: FiStar,          title: "Reviews & Ratings",     desc: "Make informed choices with genuine customer reviews and verified ratings." },
];

const stats = [
  { value: "500+",    label: "Events Listed",     icon: FiCalendar },
  { value: "1,200+", label: "Happy Customers",   icon: FiUsers },
  { value: "80+",    label: "Verified Vendors",  icon: FiAward },
  { value: "4.9",    label: "Average Rating",    icon: FiStar },
];

const testimonials = [
  { name: "Sara Ahmed",    role: "Bride",                    text: "Planning my wedding was so stress-free! Found the perfect venue within minutes and the messaging feature made communication effortless.", initials: "SA" },
  { name: "Bilal Khan",   role: "Corporate Event Manager",  text: "The bidding system saved us 30% on our annual conference. Vendors are responsive and professional.", initials: "BK" },
  { name: "Fatima Malik", role: "Birthday Party Host",      text: "Absolutely loved the experience! From discovery to booking took less than 10 minutes. Highly recommended!", initials: "FM" },
];

export default function LandingScreen() {
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    if (userInfo) navigate("/home");
  }, [userInfo, navigate]);

  const statsRef = useRef(null);
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !animated) setAnimated(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [animated]);

  return (
    <div className="landing-page">

      {/* ── TOP NAV ── */}
      <nav className="landing-nav">
        <div className="nav-inner">
          <div className="nav-logo">
            <FiCalendar className="nav-logo-icon" />
            EventOS
          </div>
          <div className="nav-links">
            <button onClick={() => navigate("/home")} className="nav-link-btn">Browse Events</button>
            <a href="http://localhost:3001" className="nav-link-btn" target="_blank" rel="noopener noreferrer">For Vendors</a>
          </div>
          <div className="nav-ctas">
            <button className="nav-signin-btn" onClick={() => navigate("/signin")}>Sign In</button>
            <button className="nav-signup-btn" onClick={() => navigate("/signup")}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="landing-hero">
        <div className="hero-bg-shapes">
          <div className="shape shape-1" />
          <div className="shape shape-2" />
          <div className="shape shape-3" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <FiZap className="badge-icon" />
            Pakistan's #1 Event Platform
          </div>
          <h1 className="hero-title">
            Create Unforgettable<br />
            <span className="hero-accent">Event Experiences</span>
          </h1>
          <p className="hero-subtitle">
            Connect with top-rated vendors, discover stunning venues, and book
            your dream event — all in one beautifully simple platform.
          </p>
          <div className="hero-cta-group">
            <button className="btn-primary-lg" onClick={() => navigate("/signup")}>
              Get Started — It's Free
              <FiArrowRight className="btn-icon" />
            </button>
            <button className="btn-ghost-lg" onClick={() => navigate("/signin")}>
              Sign In
            </button>
          </div>
          <div className="hero-trust-row">
            <span className="trust-pill"><FiLock size={13} /> Secure Payments</span>
            <span className="trust-pill"><FiCheckCircle size={13} /> Verified Vendors</span>
            <span className="trust-pill"><FiMapPin size={13} /> Location Search</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-cards">
            <div className="event-card card-top">
              <div className="ec-icon-wrap ec-purple"><FiGift size={20} /></div>
              <div className="ec-info">
                <div className="ec-title">Wedding Package</div>
                <div className="ec-meta">Grand Ballroom · 500 Guests</div>
              </div>
              <div className="ec-price">PKR 2.5L</div>
            </div>
            <div className="event-card card-mid">
              <div className="ec-icon-wrap ec-blue"><FiMic size={20} /></div>
              <div className="ec-info">
                <div className="ec-title">Corporate Conference</div>
                <div className="ec-meta">Executive Hall · 200 Guests</div>
              </div>
              <div className="ec-price">PKR 80K</div>
            </div>
            <div className="event-card card-bot">
              <div className="ec-icon-wrap ec-green"><FiCalendar size={20} /></div>
              <div className="ec-info">
                <div className="ec-title">Birthday Celebration</div>
                <div className="ec-meta">Garden Venue · 80 Guests</div>
              </div>
              <div className="ec-price">PKR 35K</div>
            </div>
            <div className="live-badge">
              <FiActivity size={12} />
              Live Bidding Active
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="landing-stats" ref={statsRef}>
        <div className="stats-inner">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className={`stat-card ${animated ? "anim-in" : ""}`} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="stat-icon-wrap"><Icon size={22} /></div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="landing-section landing-how">
        <div className="section-header">
          <div className="section-tag">Simple Process</div>
          <h2 className="section-title">Book Your Event in 3 Easy Steps</h2>
          <p className="section-desc">From discovery to confirmation — our streamlined process gets you there in minutes.</p>
        </div>
        <div className="steps-row">
          <div className="step-card">
            <div className="step-num">01</div>
            <div className="step-icon-wrap"><FiSearch size={28} /></div>
            <h3>Discover</h3>
            <p>Browse curated events and venues filtered by location, category, and budget.</p>
          </div>
          <div className="step-arrow"><FiArrowRight size={28} /></div>
          <div className="step-card">
            <div className="step-num">02</div>
            <div className="step-icon-wrap"><FiMessageCircle size={28} /></div>
            <h3>Connect</h3>
            <p>Message vendors directly, negotiate via live bidding, and compare packages.</p>
          </div>
          <div className="step-arrow"><FiArrowRight size={28} /></div>
          <div className="step-card">
            <div className="step-num">03</div>
            <div className="step-icon-wrap"><FiCheckCircle size={28} /></div>
            <h3>Book & Pay</h3>
            <p>Confirm your booking and pay securely via PayPal. Get instant confirmation.</p>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="landing-section landing-features">
        <div className="section-header">
          <div className="section-tag">Platform Features</div>
          <h2 className="section-title">Everything You Need, All in One Place</h2>
          <p className="section-desc">Powerful tools for customers and vendors to collaborate seamlessly.</p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="feature-card">
                <div className="feature-icon-wrap"><Icon size={24} /></div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="landing-section landing-testi">
        <div className="section-header">
          <div className="section-tag">Customer Stories</div>
          <h2 className="section-title">Loved by Thousands</h2>
          <p className="section-desc">Real experiences from real customers who made their events unforgettable.</p>
        </div>
        <div className="testi-grid">
          {testimonials.map((t, i) => (
            <div key={i} className="testi-card">
              <div className="testi-stars">
                {[...Array(5)].map((_, si) => <FiStar key={si} size={14} className="star-filled" />)}
              </div>
              <p className="testi-text">"{t.text}"</p>
              <div className="testi-author">
                <div className="testi-avatar">{t.initials}</div>
                <div>
                  <div className="testi-name">{t.name}</div>
                  <div className="testi-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── VENDOR CTA ── */}
      <section className="landing-vendor-cta">
        <div className="vendor-cta-inner">
          <div className="vendor-cta-left">
            <div className="section-tag vendor-tag"><FiBriefcase size={13} /> For Business Owners</div>
            <h2>Are You a Vendor?</h2>
            <p>Join our growing network of verified vendors. List your services, receive bookings, and grow your event business with real-time tools.</p>
            <a href="http://localhost:3001" className="btn-vendor" target="_blank" rel="noopener noreferrer">
              Open Vendor Portal
              <FiArrowRight size={16} />
            </a>
          </div>
          <div className="vendor-stats-row">
            <div className="vstat-box">
              <FiUsers size={24} className="vstat-icon" />
              <div className="vstat-val">80+</div>
              <div className="vstat-lbl">Active Vendors</div>
            </div>
            <div className="vstat-box">
              <FiTrendingUp size={24} className="vstat-icon" />
              <div className="vstat-val">PKR 5M+</div>
              <div className="vstat-lbl">Revenue Generated</div>
            </div>
            <div className="vstat-box">
              <FiHeart size={24} className="vstat-icon" />
              <div className="vstat-val">98%</div>
              <div className="vstat-lbl">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="landing-final-cta">
        <div className="final-cta-inner">
          <FiCalendar size={40} className="final-icon" />
          <h2>Ready to Plan Your Perfect Event?</h2>
          <p>Join thousands of happy customers who trust our platform for their most important moments.</p>
          <div className="final-cta-btns">
            <button className="btn-primary-lg" onClick={() => navigate("/signup")}>
              Create Free Account <FiArrowRight size={16} />
            </button>
            <button className="btn-ghost-lg" onClick={() => navigate("/home")}>
              Browse Events
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">
              <FiCalendar size={20} />
              EventOS
            </div>
            <p>Pakistan's premier event organization platform connecting customers with top vendors.</p>
          </div>
          <div className="footer-col">
            <h4>Platform</h4>
            <button onClick={() => navigate("/home")}>Browse Events</button>
            <button onClick={() => navigate("/signup")}>Sign Up</button>
            <button onClick={() => navigate("/signin")}>Sign In</button>
            <a href="http://localhost:3001" target="_blank" rel="noopener noreferrer">Vendor Portal</a>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <button onClick={() => {}}>Help Center</button>
            <button onClick={() => {}}>Privacy Policy</button>
            <button onClick={() => {}}>Terms of Service</button>
            <button onClick={() => {}}>Contact Us</button>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Event Organization System. All Rights Reserved.</span>
        </div>
      </footer>
    </div>
  );
}
