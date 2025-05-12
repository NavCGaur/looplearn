import { Outlet } from "react-router-dom";

// This component serves as a wrapper/layout for all Spaced Repetition routes
const SpacedRepetitionLayout = () => {
  return (
    <div className="w-full">
      
      {/* Common UI elements for all spaced repetition pages can go here */}
      <div className="bg-white rounded-lg shadow">
        {/* The Outlet will render the child routes */}
        <Outlet />
      </div>
    </div>
  );
};

export default SpacedRepetitionLayout;