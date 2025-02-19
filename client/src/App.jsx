// eslint-disable-next-line no-unused-vars
import React from "react";
// We use Route in order to define the different routes of our application
import { Routes, Route } from "react-router-dom";
// We import all the components we need in our app
import Navbar from "./components/navbar";
import RecordList from "./components/memberList";
import Create from "./components/create";
import Edit from "./components/edit";
import Login from "./components/login"
import CoachAdminsList from "./components/coachAdminsList"
import OTP from "./components/otp"
import MemberFeedback from "./components/memberFeedback"
import ViewOwnFeedback from "./components/viewOwnFeedback";
import AdminViewFeedbacks from "./components/adminViewFeedbacks";
import CreateEvents from "./components/events";
import ViewEvents from "./components/viewEvents";
import ViewSignedUpEvents from "./components/viewSignedupEvents";
import ViewTotalSignups from "./components/viewSignupsADMIN";
import NotFound from './components/NotFound';


const App = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route exact path='/Login' element={<Login />} />
        <Route exact path='/' element={<RecordList />} />
        <Route exact path='/edit/:id' element={<Edit />} />
        <Route exact path='/create' element={<Create />} />
        <Route exact path='/view-coaches-admins' element={<CoachAdminsList />} />
        <Route exact path='/verifyOTP' element={<OTP />} />
        <Route exact path='/MemberFeedback' element={<MemberFeedback />} />
        <Route exact path='/ViewOwnFeedback' element={<ViewOwnFeedback />} />
        <Route exact path='/AdminViewFeedbacks' element={<AdminViewFeedbacks />} />
        <Route exact path='/CreateEvents' element={<CreateEvents />} />
        <Route exact path='/ViewEvents' element={<ViewEvents />} />
        <Route exact path='/ViewSignedupEvents' element={<ViewSignedUpEvents />} />
        <Route exact path='/ViewTotalSignups' element={<ViewTotalSignups />} />
        <Route path='*' element={<NotFound />} />


      </Routes>
    </div>
  );
};

export default App;

