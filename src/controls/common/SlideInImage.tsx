import React, { useState, useEffect } from "react";

interface SlideInImageProps {
  imageSrc: string;
  altText: string;
  duration?: number;
}

const SlideInImage: React.FC<SlideInImageProps> = ({
  imageSrc,
  altText,
  duration = 500,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="overflow-hidden relative h-full flex items-end justify-center">
      <img
        src={imageSrc}
        alt={altText}
        className={`transform transition-transform duration-${duration} ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        }`}
      />
    </div>
  );
};

export default SlideInImage;
