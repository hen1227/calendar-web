import './App.css';
import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import CalendarPage from "./calendar/CalendarPage";
import {AuthProvider} from "./auth/AuthContext";
import BottomNavbar from "./BottomNavbar";
import CreatePage from "./create/CreatePage";
import AccountPage from "./account/AccountPage";
import CreateClubPage from "./create/CreateClubPage";
import LoginPage from "./auth/LoginPage";
import CreateEventPage from "./create/CreateEventPage";
import ClubDetailsPage from "./calendar/ClubDetailsPage";
import EditClubDetailsPage from "./create/EditClubDetailsPage";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import DiningPage from "./dining/DiningPage";

// TODO: Fix text wrapping looking bad on calendar view.

function App() {
  return (
      <AuthProvider>
          <Router>
              {/*<Navbar />*/}
              <div className={"app"}>
                  <Routes>
                      <Route path="/" exact element={<CalendarPage />} />
                      <Route path="/dining" exact element={<DiningPage />} />
                      <Route path="/calendar" exact element={<CalendarPage />} />
                      <Route path="/login" exact element={<LoginPage />} />
                      <Route path="/create" element={<CreatePage />} />
                      <Route path="/create/club" element={<CreateClubPage />} />
                      <Route path="/create/event" element={<CreateEventPage />} />
                      <Route path="/club/:clubId" element={<ClubDetailsPage />} />
                      <Route path="/edit/:clubId" element={<EditClubDetailsPage />} />
                      <Route path="/account" element={<AccountPage />} />
                  </Routes>
                  <BottomNavbar />
              </div>
              <ToastContainer
                  position="top-right"
                  autoClose={2000}
                  hideProgressBar
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="dark"
              />
          </Router>
      </AuthProvider>
  );
}

export default App;
