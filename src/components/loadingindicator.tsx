interface LoadingIndicatorProps {
  size?: "sm" | "md" | "lg";
  color: string;
  message: string;
}

const classSizes = {
  sm: "spinner-border-sm",
  lg: "spinner-border-lg",
  md: "",
};

const LoadingIndicator = ({
  size = "md",
  color = "white",
  message,
}: LoadingIndicatorProps) => {
  const spinerSizeClass = classSizes[size];

  return (
    <div
      className="d-flex justify-content-center flex-column align-items-center"
      style={{ height: "100%" }}
    >
      <div
        className={`spinner-border ${spinerSizeClass}`}
        role="status"
        style={{ color }}
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      {message && <p className="mt-2 text-white">{message}</p>}
    </div>
  );
};

export default LoadingIndicator;
