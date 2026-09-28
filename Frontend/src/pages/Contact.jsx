import { useState } from "react";
import "./Contact.css";
// import Navbar from "../components/Navbar";
import contactImg from "../assets/images/Contact.jpg";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    if (!form.name || !form.email || !form.message) {
      setStatus({
        type: "error",
        message: "Please provide your name, email, and message.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      let json = null;
      let text = "";

      if (contentType.includes("application/json")) {
        json = await res.json().catch(() => null);
      } else {
        text = await res.text().catch(() => "");
      }

      if (!res.ok) {
        const msg =
          json?.message ||
          (text && text.slice(0, 200)) ||
          `Request failed (${res.status}). Please try again.`;
        throw new Error(msg);
      }

      setStatus({
        type: "success",
        message: json?.message || "Message sent successfully!",
      });
      setForm({ name: "", email: "", subject: "", phone: "", message: "" });
    } catch (err) {
      setStatus({
        type: "error",
        message: err.message || "Failed to send message.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* BLACK HEADER BAR */}

      {/* HERO SECTION */}
      <section className="contact-section">
        <div
          className="contact-hero"
          style={{ backgroundImage: `url(${contactImg})` }}
        >
          {/* <div className="nav-section">
            <Navbar />
          </div> */}
          <div className="contact-overlay">
            <h1>CONTACT</h1>
            <p>Send me your questions, comments, or suggestions!</p>
          </div>

          <div className="torn-edge"></div>
        </div>
      </section>

      {/* TEXT SECTION */}
      <section className="contact-info">
        <span className="contact-tag">GET IN TOUCH</span>

        <h2 className="contact-title">Contact Form</h2>

        <p className="contact-subtitle">
          Send me your questions, comments, or suggestions!
        </p>

        <p className="contact-text">
          If you'd like to work with me or you have a question or comment, you
          can contact me using the form below. You can also find{" "}
          <span className="contact-link">more info about me here</span>.
        </p>

        <p className="contact-note">
          Sometimes I'm busy traveling, but I try to respond to any messages!
        </p>
      </section>

      {/* NEW CARD-STYLE FORM (THIS REPLACES THE OLD FORM) */}
      <section className="contact-form-wrapper">
        <div className="contact-form-card">
          <h2 className="form-title">
            Make Your <span>Contact</span> Through This Form
          </h2>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ex. John Smith"
                  autoComplete="name"
                />
              </div>

              <div className="form-group">
                <label>Your Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Ex. john@email.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-row">

              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Ex. Travel Inquiry"
                />
              </div>


              <div className="form-group">
                <label>Contact Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Ex. +1 234 567 890"
                  autoComplete="tel"
                />
              </div>

            </div>

            <div className="form-row">
              <div className="form-group full">
                <label>Your Message</label>
                <textarea
                  rows="5"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                />
              </div>
            </div>

            {status.message && (
              <div className={`form-status ${status.type}`}>
                {status.message}
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
};

export default Contact;
