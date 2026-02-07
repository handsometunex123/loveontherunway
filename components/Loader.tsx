interface LoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

export default function Loader({ 
  size = "md", 
  text, 
  fullScreen = false,
  overlay = false 
}: LoaderProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
    xl: "h-16 w-16 border-4"
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg"
  };

  const loader = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative">
        {/* Outer ring */}
        <div className={`${sizeClasses[size]} rounded-full border-slate-200`}></div>
        {/* Spinning ring */}
        <div 
          className={`${sizeClasses[size]} absolute inset-0 animate-spin rounded-full border-transparent border-t-purple-600 border-r-purple-600`}
          style={{ animationDuration: '0.8s' }}
        ></div>
      </div>
      {text && (
        <p className={`${textSizeClasses[size]} font-medium text-slate-700 animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${overlay ? 'bg-white/80 backdrop-blur-sm' : 'bg-white'}`}>
        {loader}
      </div>
    );
  }

  return loader;
}

// Inline loader for buttons
export function ButtonLoader({ 
  size = "sm", 
  color = "white" 
}: { 
  size?: "sm" | "md";
  color?: "white" | "rose" | "emerald" | "purple";
}) {
  const sizeClass = size === "sm" ? "h-4 w-4 border-2" : "h-5 w-5 border-2";
  
  const colorClasses = {
    white: { base: "border-white/30", spin: "border-t-white border-r-white" },
    rose: { base: "border-rose-700/30", spin: "border-t-rose-700 border-r-rose-700" },
    emerald: { base: "border-emerald-700/30", spin: "border-t-emerald-700 border-r-emerald-700" },
    purple: { base: "border-purple-700/30", spin: "border-t-purple-700 border-r-purple-700" }
  };
  
  return (
    <div className="relative inline-block">
      <div className={`${sizeClass} rounded-full ${colorClasses[color].base}`}></div>
      <div 
        className={`${sizeClass} absolute inset-0 animate-spin rounded-full border-transparent ${colorClasses[color].spin}`}
        style={{ animationDuration: '0.6s' }}
      ></div>
    </div>
  );
}
