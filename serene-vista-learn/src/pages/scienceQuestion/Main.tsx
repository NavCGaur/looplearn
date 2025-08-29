import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Brain, Database, Home, Settings } from "lucide-react";

function Navigation() {
  const location = useLocation();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-900 flex items-center">
            <Brain className="mr-2 h-6 w-6 text-blue-600" />
            AI Question Platform
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <Link to="/admin/dashboard/science-question-generator">
            <Button variant={location.pathname === "/" ? "default" : "ghost"} size="sm">
              <Home className="mr-2 h-4 w-4" />
              AI Generator
            </Button>
          </Link>
          <Link to="/admin/dashboard/bulk-upload">
            <Button variant={location.pathname === "/bulk-upload" ? "default" : "ghost"} size="sm">
              <Database className="mr-2 h-4 w-4" />
              Bulk Upload
            </Button>
          </Link>
          {/* Math links */}
          <Link to="/admin/dashboard/math-question-generator">
            <Button variant={location.pathname === "/math-question-generator" ? "default" : "ghost"} size="sm">
              <Home className="mr-2 h-4 w-4" />
              Math Generator
            </Button>
          </Link>
          <Link to="/admin/dashboard/math-bulk-upload">
            <Button variant={location.pathname === "/math-bulk-upload" ? "default" : "ghost"} size="sm">
              <Database className="mr-2 h-4 w-4" />
              Math Bulk Upload
            </Button>
          </Link>
          <Link to="/admin/dashboard/question-manager">
            <Button variant={location.pathname === "/question-manager" ? "default" : "ghost"} size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Manage Questions
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
