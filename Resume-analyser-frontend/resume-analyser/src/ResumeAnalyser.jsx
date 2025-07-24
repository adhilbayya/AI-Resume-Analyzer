import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const FONT_FAMILY = 'Inter, Roboto, "Segoe UI", Arial, sans-serif';

const ResumeAnalyser = () => {
  const [role, setRole] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [darkMode, setDarkMode] = useState(true);

  const handleResumeChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setResumeText(file);
  };

  const handleSubmit = async () => {
    if (!role || !resumeText) {
      setError("Please provide both the role and resume");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("role", role);
    formData.append("file", resumeText);

    const api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
    });

    try {
      const res = await api.post("/resume/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setResult(res.data);
    } catch {
      setError("Unable to analyse resume");
    } finally {
      setLoading(false);
    }
  };

  const bgClass = darkMode
    ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen text-gray-100"
    : "bg-gradient-to-br from-gray-100 via-white to-gray-200 min-h-screen text-gray-900";
  const cardClass = darkMode
    ? "bg-gray-800 text-gray-100 shadow-lg"
    : "bg-white text-gray-900 shadow-lg";
  const inputClass = darkMode
    ? "rounded border w-full p-2 mt-1 bg-gray-900 text-gray-100 border-gray-700 focus:border-blue-500"
    : "rounded border w-full p-2 mt-1 bg-white text-gray-900 border-gray-300 focus:border-blue-500";
  const buttonClass = darkMode
    ? "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:cursor-not-allowed transition"
    : "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:cursor-not-allowed transition";
  const toggleClass = darkMode
    ? "bg-gray-700 text-gray-100 hover:bg-gray-600"
    : "bg-gray-200 text-gray-900 hover:bg-gray-300";
  const proseClass = darkMode ? "prose prose-invert" : "prose";

  return (
    <div
      className={bgClass}
      style={{ fontFamily: FONT_FAMILY, minHeight: "100vh", paddingBottom: 40 }}
    >
      <div className="max-w-xl mx-auto pt-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold tracking-tight">
            AI Resume Enhancer
          </h2>
          <div className="flex items-center gap-2">
            <button
              className={`px-3 py-1 rounded transition ${toggleClass}`}
              onClick={() =>
                (window.location.href = "mailto:adhilvk445@gmail.com")
              }
              aria-label="Send feedback via email"
              style={{
                fontWeight: 600,
                border: "1px solid #2563eb",
                color: darkMode ? "#93c5fd" : "#2563eb",
                background: "transparent",
              }}
            >
              Feedback
            </button>
            <button
              className={`px-3 py-1 rounded transition ${toggleClass}`}
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle dark/light mode"
            >
              {darkMode ? "🌙 Dark" : "☀️ Light"}
            </button>
          </div>
        </div>
        <div className={cardClass + " p-6 rounded-lg mb-6"}>
          <div className="mb-4">
            <label className="mb-1 block font-semibold">Target Role:</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="mb-4">
            <label className="font-semibold">
              Upload Resume (.txt or parsed text pdf):{" "}
            </label>
            <input
              type="file"
              accept=".pdf, .doc, .docx, .txt"
              onChange={handleResumeChange}
              className={inputClass + " cursor-pointer"}
            />
          </div>
          {}
          {resumeText && resumeText.name && (
            <div style={{ fontSize: 12, marginBottom: 8 }}>
              <strong>File:</strong> {resumeText.name} <br />
              <strong>Type:</strong> {resumeText.type || "N/A"} <br />
              <strong>Size:</strong> {resumeText.size} bytes
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={buttonClass}
          >
            {loading ? "Analyzing..." : "Analyse resume"}
          </button>
          {error && <p className="text-red-400 mt-3">{error}</p>}
        </div>
        {result && (
          <div
            className={
              cardClass +
              " p-6 rounded-2xl mt-8 shadow-xl border border-gray-200"
            }
            style={{
              maxWidth: 600,
              margin: "0 auto",
              background: darkMode ? "#23272f" : "#fff",
              color: darkMode ? "#f3f4f6" : "#23272f",
            }}
          >
            <h3 className="text-2xl font-bold mb-4 text-blue-600">
              AI Resume Insights
            </h3>
            <div className="space-y-4">
              <section>
                <h4 className="font-semibold text-lg mb-2 text-green-600 flex items-center">
                  <span role="img" aria-label="check" className="mr-2">
                    ✅
                  </span>{" "}
                  Matching Skills
                </h4>
                <ul className="list-disc ml-6">
                  {Array.isArray(result.skills_found) &&
                  result.skills_found.length > 0 ? (
                    result.skills_found.map((skill, idx) => (
                      <li key={idx} className="text-green-700 font-medium">
                        {skill}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-400">None found</li>
                  )}
                </ul>
              </section>
              <section>
                <h4 className="font-semibold text-lg mb-2 text-red-600 flex items-center">
                  <span role="img" aria-label="cross" className="mr-2">
                    ❌
                  </span>{" "}
                  Missing Skills
                </h4>
                <ul className="list-disc ml-6">
                  {Array.isArray(result.skills_missing) &&
                  result.skills_missing.length > 0 ? (
                    result.skills_missing.map((skill, idx) => (
                      <li key={idx} className="text-red-700 font-medium">
                        {skill}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-400">None missing</li>
                  )}
                </ul>
              </section>
              <section>
                <h4 className="font-semibold text-lg mb-2 text-blue-600">
                  Match Score
                </h4>
                <div className="text-2xl font-bold">
                  {typeof result.match_percent === "number"
                    ? result.match_percent.toFixed(2) + "%"
                    : "N/A"}
                </div>
              </section>
              <section>
                <h4 className="font-semibold text-lg mb-2 text-purple-600">
                  AI Feedback
                </h4>
                <div className={proseClass + " max-w-full"}>
                  <ReactMarkdown>
                    {result.ai_feedback || "No AI feedback available"}
                  </ReactMarkdown>
                </div>
              </section>
              <section>
                <h4 className="font-semibold text-lg mb-2 text-gray-600">
                  Role
                </h4>
                <div className="text-base font-medium">
                  {result.role || "N/A"}
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ResumeAnalyser;
