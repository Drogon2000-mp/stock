import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-2 text-center px-4">
    <p className="font-display text-4xl">404</p>
    <p className="text-ink-600 dark:text-chalk-200/60">This page doesn't exist.</p>
    <Link to="/" className="text-brass-600 dark:text-brass-400 font-medium mt-2">
      Back to dashboard
    </Link>
  </div>
);

export default NotFound;
