import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider, ThemeProvider } from '@/contexts';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { router } from '@/routes';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <RouterProvider router={router} />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
