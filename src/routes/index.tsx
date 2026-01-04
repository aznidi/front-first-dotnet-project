import { createBrowserRouter, Navigate } from 'react-router-dom';
import { 
  HomePage, 
  LoginPage, 
  RegisterPage, 
  ProfilePage,
  AdminDashboard,
  StudentsPage,
  TeachersPage,
  SubjectsPage,
  ChatPage,
  ClassesPage
} from '@/pages';
import { ProtectedRoute } from '@/components/routes/ProtectedRoute';
import { AdminRoute } from '@/components/routes/AdminRoute';
import { RootErrorBoundary } from '@/components/RootErrorBoundary';
import { ChatPageNew } from '@/pages/admin/ChatPageNew';

export const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <RootErrorBoundary />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        children: [
          {
            index: true,
            element: (
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            ),
          },
          {
            path: 'students',
            element: (
              <AdminRoute>
                <StudentsPage />
              </AdminRoute>
            ),
          },
          {
            path: 'teachers',
            element: (
              <AdminRoute>
                <TeachersPage />
              </AdminRoute>
            ),
          },
          {
            path: 'subjects',
            element: (
              <AdminRoute>
                <SubjectsPage />
              </AdminRoute>
            ),
          },
          {
            path: 'chat',
            element: (
              <AdminRoute>
                <ChatPageNew />
              </AdminRoute>
            ),
          },
          {
            path: 'classes',
            element: (
              <AdminRoute>
                <ClassesPage />
              </AdminRoute>
            ),
          },
        ],
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
