import { Link } from "react-router-dom";
import { User, Shield } from "lucide-react";
import { Button, ThemeToggle } from "@/components/ui";
import { useAuth } from "@/hooks";

export const Header = () => {
  const { isAuthenticated, user, isAdmin } = useAuth();

  return (
    <header className="border-b bg-card sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-card/95">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <h1 className="text-2xl font-bold text-foreground">
              Schooly
            </h1>
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/">Home</Link>
            </Button>
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Button variant="ghost" asChild>
                    <Link to="/admin">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin
                    </Link>
                  </Button>
                )}
                <Button variant="ghost" asChild>
                  <Link to="/profile">
                    <User className="mr-2 h-4 w-4" />
                    {user?.name}
                  </Link>
                </Button>
              </>
            ) : (
              <Button variant="default" size="sm" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            )}
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
};
