import ResumeAnalyser from "./ResumeAnalyser.jsx";

function App() {
  return (
    <div>
      <ResumeAnalyser />
      <div style={{ textAlign: "center", marginTop: 40, fontSize: 16 }}>
        Feedback? Email us at{" "}
        <a
          href="mailto:adhilvk445@gmail.com"
          style={{ color: "#2563eb", textDecoration: "underline" }}
        >
          adhilvk445@gmail.com
        </a>
      </div>
    </div>
  );
}

export default App;
