import React, { useState, useEffect } from "react";

type MovingCarType = {
  id: number;
  onRemove: (id: number) => void;
};

const MovingCar = ({ id, onRemove }: MovingCarType) => {
  // Define the 6 "roads" as horizontal positions (left values)
  const roads = [
    window.innerWidth * 0.1,  // 10% width of the screen
    window.innerWidth * 0.2,  // 20% width of the screen
    window.innerWidth * 0.3,  // 30% width of the screen
    window.innerWidth * 0.4,  // 40% width of the screen
    window.innerWidth * 0.5,  // 50% width of the screen
    window.innerWidth * 0.6,  // 60% width of the screen
  ];

  const [carPosition, setCarPosition] = useState({ top: 0, left: roads[Math.floor(Math.random() * roads.length)] });
  const [direction, setDirection] = useState(1); // 1 for moving down, -1 for moving up
  const [isOutOfBounds, setIsOutOfBounds] = useState(false);

  const randomPosition = () => ({
    top: Math.random() * (window.innerHeight - 50), // Random initial vertical position
  });

  useEffect(() => {
    // Initialize car position randomly
    setCarPosition((prev) => ({ ...prev, ...randomPosition() }));

    // Animation logic
    const moveCar = () => {
      setCarPosition((prev) => {
        let newTop = prev.top + direction * 2; // Adjust speed here (2px per frame)

        // Bounce the car when hitting the top or bottom edges
        if (newTop < 0 || newTop > window.innerHeight - 50) {
          setDirection((prevDirection) => -prevDirection); // Reverse direction on hit
          newTop = Math.max(0, Math.min(window.innerHeight - 50, newTop));
        }

        // Check if the car has gone out of bounds and should be removed
        if (!isOutOfBounds && (newTop < 0 || newTop > window.innerHeight - 50)) {
          setIsOutOfBounds(true);
          onRemove(id);
        }

        return { top: newTop, left: prev.left }; // Only top position changes, left remains constant
      });

      requestAnimationFrame(moveCar);
    };

    // Start the animation
    const animationId = requestAnimationFrame(moveCar);

    return () => cancelAnimationFrame(animationId); // Cleanup
  }, [direction, id, onRemove, isOutOfBounds]);

  return (
    <div
      style={{
        position: "absolute",
        top: `${carPosition.top}px`,
        left: `${carPosition.left}px`, // Fixed "road" for each car
        width: "50px",
        height: "50px",
        background: "red",
        borderRadius: "5px",
      }}
    >
      🚗
    </div>
  );
};

export default MovingCar;