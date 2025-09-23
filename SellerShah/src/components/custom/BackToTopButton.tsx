import React from "react";

interface BackToTopButtonProps {
  className?: string;
}

const BackToTopButton: React.FC<BackToTopButtonProps> = ({ className }) => {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <button
      onClick={handleScrollToTop}
      className={`fixed bottom-8 right-8 z-50 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg p-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${className || ""}`}
      aria-label="Back to top"
    >
      ↑
    </button>
  );
};

export default BackToTopButton;
