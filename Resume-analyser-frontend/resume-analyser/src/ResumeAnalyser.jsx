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
      baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080", // Fallback for local development
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
          <button
            className={`px-3 py-1 rounded transition ${toggleClass}`}
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle dark/light mode"
          >
            {darkMode ? "🌙 Dark" : "☀️ Light"}
          </button>
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
          <div className={cardClass + " p-6 rounded-lg mt-8"}>
            <h3 className="text-xl font-semibold mb-4">AI Resume Insights</h3>
            <div className={proseClass}>
              <ReactMarkdown>
                {result.ai_feedback || "No AI feedback available"}
              </ReactMarkdown>
            </div>
            <div className="mt-4 space-y-1">
              <p>
                <span className="font-semibold">Role:</span> {result.role}
              </p>
              <p>
                <span className="font-semibold">Matched Skills:</span>{" "}
                {result.skills_found.join(", ")}
              </p>
              <p>
                <span className="font-semibold">Missing Skills:</span>{" "}
                {result.skills_missing.join(", ")}
              </p>
              <p>
                <span className="font-semibold">Match Score:</span>{" "}
                {result.match_percent?.toFixed(2)}%
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ResumeAnalyser;
