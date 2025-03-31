import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="text-center py-4">
      <p className="text-sm">
        &copy; {new Date().getFullYear()} ResuMate. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
