import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const statusToMessage = {
  success: {
    title: "Email Confirmed!",
    message:
      "Your email has been successfully confirmed. You can now log in and enjoy all features.",
    color: "green",
    emoji: "✅",
  },
  failure: {
    title: "Confirmation Failed",
    message:
      "Sorry, we could not confirm your email. Please try again or contact support.",
    color: "red",
    emoji: "❌",
  },
};

export default function EmailConfirmationPage() {
  const [params] = useSearchParams();
  const status =
    params.get("status") === "success" ? "success" : "failure";
  const { title, message, color, emoji } = statusToMessage[status];

  useEffect(() => {
    // Optionally, you could auto-redirect after a few seconds
    // setTimeout(() => window.location.href = '/login', 4000);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%)",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          padding: "2.5rem 2rem",
          maxWidth: 400,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>{emoji}</div>
        <h1
          style={{
            color,
            fontSize: 28,
            marginBottom: 12,
          }}
        >
          {title}
        </h1>
        <p
          style={{
            color: "#444",
            fontSize: 18,
            marginBottom: 24,
          }}
        >
          {message}
        </p>
        <a
          href="/login"
          style={{
            display: "inline-block",
            background: color,
            color: "#fff",
            borderRadius: 8,
            padding: "0.75rem 2rem",
            fontWeight: 600,
            textDecoration: "none",
            fontSize: 16,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            transition: "background 0.2s",
          }}
        >
          Go to Login
        </a>
      </div>
    </div>
  );
}
