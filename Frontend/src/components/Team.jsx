import "./Team.css";
import { useRef } from "react";
import useScrollAnimation from "../hooks/ScrollAnimation";

import person1 from "../assets/images/person1.jpg";
import person2 from "../assets/images/person2.jpg";
import person3 from "../assets/images/person3.jpg";
import person4 from "../assets/images/person4.jpg";

import { FaFacebookF, FaTwitter, FaPinterestP, FaLinkedinIn } from "react-icons/fa";

const teamData = [
  {
    img: person1,
    name: "Jeanette Kingston",
    role: "Chief Executive Officer",
  },
  {
    img: person2,
    name: "Alan Cooper",
    role: "Vice President",
  },
  {
    img: person3,
    name: "John Smithy",
    role: "Chief Financial Officer",
  },
  {
    img: person4,
    name: "Peter Sandler",
    role: "Senior Engineer",
  },
];

export default function Team() {
  const teamRef = useRef(null);
  useScrollAnimation(teamRef);

  return (
    <section className="team-section" ref={teamRef}>
      <div className="team-container">
        <div className="team-header animate fade-up">
          <span className="section-label">Our Team</span>
          <h2 className="tour-title">Meet The Experts</h2>
          <p>Dedicated professionals committed to delivering excellence in everything we do</p>
        </div>

        <div className="team-grid">
          {teamData.map((member, i) => (
            <div
              key={i}
              className={`team-cards animate fade-up delay-${(i % 4) + 1}`}
            >
              <div className="team-card-inner">
                <div className="team-image-wrapper">
                  <div
                    className="team-img"
                    style={{ backgroundImage: `url(${member.img})` }}
                  >
                    <div className="team-overlay-gradient"></div>
                  </div>
                  <div className="team-socials">
                    <a href="#" aria-label="Facebook" className="social-link">
                      <FaFacebookF />
                    </a>
                    <a href="#" aria-label="Twitter" className="social-link">
                      <FaTwitter />
                    </a>
                    <a href="#" aria-label="LinkedIn" className="social-link">
                      <FaLinkedinIn />
                    </a>
                    <a href="#" aria-label="Pinterest" className="social-link">
                      <FaPinterestP />
                    </a>
                  </div>
                </div>
                <div className="team-info">
                  <h4>{member.name}</h4>
                  <span className="team-role">{member.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
