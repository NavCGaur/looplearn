
export const Spinner = ({ size = "default", className = "" }) => {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    default: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-3",
    xl: "h-12 w-12 border-4",
  };

  const spinnerSize = sizeClasses[size] || sizeClasses.default;

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`${spinnerSize} rounded-full border-solid border-gray-200 border-t-blue-600 animate-spin`}
        role="status"
        aria-label="loading"
      />
    </div>
  );
};