"use client";
import { useEffect, useState } from "react";

const TypingAnimation = () => {
  const words = ["Business", "Company", "Startup"];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    const currentWord = words[currentWordIndex];

    const handleTyping = () => {
      if (!isDeleting) {
        // Typing forward
        if (currentText.length < currentWord.length) {
          setCurrentText(currentWord.substring(0, currentText.length + 1));
          setTypingSpeed(80);  // Gõ chữ nhanh hơn (từ 150 → 80)
        } else {
          // Pause before deleting
          setTimeout(() => setIsDeleting(true), 1500);  // Dừng ngắn hơn (từ 2000 → 1500)
          return;
        }
      } else {
        // Deleting backward
        if (currentText.length > 0) {
          setCurrentText(currentWord.substring(0, currentText.length - 1));
          setTypingSpeed(50);  // Xóa chữ nhanh hơn (từ 100 → 50)
        } else {
          // Move to next word
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
          setTypingSpeed(500);
          return;
        }
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex, typingSpeed, words]);

  return (
    <span className="relative inline-block">
      <span className="">
        {currentText}
      </span>
      <span className="animate-pulse">|</span>
    </span>
  );
};

export default TypingAnimation;
