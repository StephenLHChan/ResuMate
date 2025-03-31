import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="text-center py-4 bg-gray-100">
      <p className="text-sm text-gray-600">
        &copy; {new Date().getFullYear()} ResuMate. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
