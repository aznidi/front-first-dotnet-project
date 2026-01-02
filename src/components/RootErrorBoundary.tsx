import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components/ui';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';

export const RootErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  let errorMessage = 'An unexpected error occurred';
  let errorStatus = '500';

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status.toString();
    errorMessage = error.statusText || error.data?.message || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertTriangle className="h-6 w-6" />
            <CardTitle>Error {errorStatus}</CardTitle>
          </div>
          <CardDescription>
            Something went wrong while loading this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium text-foreground break-words">
              {errorMessage}
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button onClick={() => navigate(-1)} variant="outline" className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Button onClick={() => navigate('/')} className="flex-1">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            If the problem persists, please contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
