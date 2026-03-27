import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen min-h-dvh items-center justify-center bg-black px-4 py-8">
      <div className="text-center max-w-sm">
        <h1 className="mb-3 text-3xl sm:text-4xl font-bold text-foreground">404</h1>
        <p className="mb-4 text-base sm:text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="text-primary underline hover:text-primary/90 text-sm sm:text-base inline-block">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
