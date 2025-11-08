import React, { useState, useEffect, useMemo } from "react";
import resumeData from "./resume.json";

const CREDENTIALS = {
  email: "intern@demo.com",
  password: "pass123",
};

const SESSION_KEY = "resume_session";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() =>
    Boolean(localStorage.getItem(SESSION_KEY))
  );

  return (
    <div className="container">
      {isLoggedIn ? (
        <ResumePage data={resumeData} onLogout={() => {
          localStorage.removeItem(SESSION_KEY);
          setIsLoggedIn(false);
        }} />
      ) : (
        <Login onSuccess={() => {
          localStorage.setItem(SESSION_KEY, "true");
          setIsLoggedIn(true);
        }} />
      )}
    </div>
  );
}

/* ---------------- LOGIN ---------------- */

function Login({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function validate() {
    if (!email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
      setError("Please enter a valid email");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    return true;
  }

  function submit(e) {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    if (email === CREDENTIALS.email && password === CREDENTIALS.password) {
      onSuccess();
    } else {
      setError("Incorrect email or password");
    }
  }

  return (
    <div className="card">
      <h2>Sign in</h2>

      <form onSubmit={submit}>
        <label className="small">
          Email
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <div style={{ height: 8 }} />

        <label className="small">
          Password
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && (
          <div role="alert" style={{ color: "crimson", marginTop: 10 }}>
            {error}
          </div>
        )}

        <button className="btn" type="submit">
          Sign in
        </button>

        <div className="small" style={{ marginTop: 10 }}>
          Use <b>intern@demo.com</b> / <b>pass123</b>
        </div>
      </form>
    </div>
  );
}

/* ---------------- RESUME ---------------- */

function ResumePage({ data, onLogout }) {
  const [query, setQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [view, setView] = useState("cards");
  const [expanded, setExpanded] = useState({});

  const allSkills = useMemo(() => data.skills || [], [data]);

  function toggleSkill(skill) {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  }

  const filteredExperiences = useMemo(() => {
    const q = query.trim().toLowerCase();

    return data.experiences.filter((exp) => {
      const text = `${exp.role} ${exp.company} ${exp.bullets.join(" ")}`.toLowerCase();

      if (q && !text.includes(q)) return false;
      if (selectedSkills.length === 0) return true;

      return selectedSkills.every((skill) =>
        text.includes(skill.toLowerCase())
      );
    });
  }, [query, selectedSkills, data]);

  function toggleExpand(id) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div>
      <button className="btn" onClick={onLogout} style={{ marginBottom: 15 }}>
        Logout
      </button>

      {/* Search + Filters */}
      <div className="card">
        <input
          className="input"
          placeholder="Search roles, companies, skills..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="chips" style={{ marginTop: 10 }}>
          {allSkills.map((skill) => (
            <button
              key={skill}
              className={`chip ${selectedSkills.includes(skill) ? "selected" : ""}`}
              onClick={() => toggleSkill(skill)}
            >
              {skill}
            </button>
          ))}
        </div>

        <button
          className="btn"
          style={{ marginTop: 10 }}
          onClick={() => window.print()}
        >
          Download / Print
        </button>
      </div>

      {/* Experiences */}
      <div className="card" style={{ marginTop: 15 }}>
        <h3>Experience</h3>

        {filteredExperiences.map((exp) => (
          <div key={exp.id} className="card" style={{ marginTop: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <b>{exp.role}</b> — {exp.company}
              </div>

              <button className="chip" onClick={() => toggleExpand(exp.id)}>
                {expanded[exp.id] ? "Hide" : "Details"}
              </button>
            </div>

            {expanded[exp.id] && (
              <ul style={{ marginTop: 10 }}>
                {exp.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
