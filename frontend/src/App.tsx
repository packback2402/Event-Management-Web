import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ToastContainer } from 'react-toastify';
import ScrollToTop from './ScrollToTop';
import RequireAuth from './components/RequireAuth';

// Lazy-loaded pages to enable route-based code splitting
const Home = React.lazy(() => import('./pages/Home'));
const Calendar = React.lazy(() => import('./pages/Calendar'));
const MyEvents = React.lazy(() => import('./pages/MyEvent'));
const ViewDetails = React.lazy(() => import('./pages/ViewDetails'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Events = React.lazy(() => import('./pages/Events'));
const Login = React.lazy(() => import('./pages/Login'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const Register = React.lazy(() => import('./pages/Register'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const AddEvent = React.lazy(() => import('./pages/AddEvent'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const Payment = React.lazy(() => import('./pages/Payment'));
const TicketQR = React.lazy(() => import('./pages/TicketQR'));
const ManageEvent = React.lazy(() => import('./pages/ManageEvent'));
const AdminViewDetails = React.lazy(() => import('./pages/admin/AdminViewDetails'));

// Layout wrapper to conditionally show Navbar/Footer
function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <Suspense
        fallback={
          <div className="w-full min-h-[50vh] flex items-center justify-center text-gray-500">
            Loading...
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Các route cần đăng nhập (user thường) */}
          <Route
            path="/calendar"
            element={
              <RequireAuth>
                <Calendar />
              </RequireAuth>
            }
          />
          <Route
            path="/myevent"
            element={
              <RequireAuth>
                <MyEvents />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
          <Route
            path="/analytics"
            element={
              <RequireAuth>
                <Analytics />
              </RequireAuth>
            }
          />
          <Route
            path="/checkout/:id"
            element={
              <RequireAuth>
                <Checkout />
              </RequireAuth>
            }
          />
          <Route
            path="/payment/:id"
            element={
              <RequireAuth>
                <Payment />
              </RequireAuth>
            }
          />
          <Route
            path="/ticket/:id"
            element={
              <RequireAuth>
                <TicketQR />
              </RequireAuth>
            }
          />
          <Route
            path="/manage-event/:eventId"
            element={
              <RequireAuth>
                <ManageEvent />
              </RequireAuth>
            }
          />
          <Route
            path="/addevent/:id"
            element={
              <RequireAuth>
                <AddEvent />
              </RequireAuth>
            }
          />
          <Route
            path="/addevent/"
            element={
              <RequireAuth>
                <AddEvent />
              </RequireAuth>
            }
          />

          {/* Các route public */}
          <Route path="/view-details/:id" element={<ViewDetails />} />
          <Route path="/events" element={<Events />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Admin Routes - yêu cầu admin login */}
          <Route
            path="/admin"
            element={
              <RequireAuth role="admin">
                <AdminDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/events/:id"
            element={
              <RequireAuth role="admin">
                <AdminViewDetails />
              </RequireAuth>
            }
          />
        </Routes>
      </Suspense>
      {!isAdminRoute && <Footer />}
    </>
  );
}

function App() {
  return (
    <>
      <BrowserRouter>
        <ScrollToTop />
        <AppLayout />
      </BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />
    </>

  );
}
export default App;