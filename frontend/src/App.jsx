import { Route, Routes } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import HomePage from "./pages/home/HomePage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import LoginPage from "./pages/auth/login/LoginPage";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";

import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";

import { Toaster } from "react-hot-toast";
import LoadingSpinner from "./components/common/LoadingSpinner";

function App() {
  const {
    data: authUser,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;

        // console.log("AUthUser Is Here", data);
      } catch (error) {
        throw new Error(error);
      }
    },
  });

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  return (
    <div className="flex max-w-6xl mx-auto">
      <Sidebar />
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <SignUpPage />} />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <HomePage />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <HomePage />}
        />
        <Route
          path="/notifications"
          element={authUser ? <NotificationPage /> : <SignUpPage />}
        />
        <Route
          path="/profile/:username"
          element={authUser ? <ProfilePage /> : <SignUpPage />}
        />
      </Routes>
      <RightPanel />
      <Toaster />
    </div>
  );
}
export default App;
