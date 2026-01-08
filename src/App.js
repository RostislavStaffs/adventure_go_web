import { Routes, Route } from "react-router-dom";
import LandingPage from "./LandingPage";
import SignUpPage from "./SignUpPage";
import LoginPage from "./login";
import ContactPage from "./ContactPage";
import AboutPage from "./AboutPage";
import MainPage from "./MainPage";
import AccountPage from "./AccountPage";
import AdminLoginPage from "./AdminLoginPage";
import AdminDashboard from "./AdminDashboard";
import UserListPage from "./UserListPage";
import ResetPasswordPage from "./ResetPasswordPage";
import AdminAccountPage from "./AdminAccountPage";
function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/main" element={<MainPage />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<UserListPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/admin/account" element={<AdminAccountPage />} />
    </Routes>
  );
}

export default App;
