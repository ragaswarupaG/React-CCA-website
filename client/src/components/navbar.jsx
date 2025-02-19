/* eslint-disable no-unused-vars */
import { useNavigate } from "react-router";
import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import { NavLink } from "react-router-dom";
import '/styles.css';

export default function Navbar() {
    const [userRole, setUserRole] = useState(null);
    const navigate = useNavigate();


    const handleLogin = () => {
        console.log("hereee")
        navigate('/login');
    };


    const handleLogout = () => {
        const confirmation = window.confirm("Are you sure that you want to logout?")
        if (!confirmation) {
            return;
        }

        sessionStorage.removeItem('token');
        navigate('/login');
    }




    useEffect(() => {

        const validateToken = async () => {
            const token = sessionStorage.getItem('token');
            if (!token) {
                return;
            }

            try {
                const response = await fetch("http://localhost:5050/record/validate-token", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });


                if (!response.ok) {
                    window.location.reload()
                    throw new Error("Invalid token!");

                }

                const data = await response.json();


                console.log("Response Data:", data);

                console.log("User Role:", data.role);


                setUserRole(data.role);
                sessionStorage.setItem('role', data.role);

            } catch (error) {
                console.error("Invalid token:", error.message);
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("role");
                navigate("/");
            }
        };
        validateToken();
    }, [navigate]);










    const token = sessionStorage.getItem('token')
    return (

        <nav className="navbar navbar-expand-lg navigationbar">

            <div className="container-fluid">
                <a className="navbar-brand">
                    <img src="logo.png" width="100" height="100" className="d-inline-block align-text-top" />
                </a>

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">

                        <li className="nav-item">
                            <NavLink className="nav-link" to="/" style={{ "color": "white" }}>
                                Member List
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/view-coaches-admins" style={{ "color": "white" }}>
                                Coaches & Admins List
                            </NavLink>
                        </li>


                        {userRole === "Admin" ? (
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/AdminViewFeedbacks" style={{ "color": "white" }}>
                                    View all feedbacks
                                </NavLink>
                            </li>
                        ) : null}



                    

                        {userRole === "Member" ? (
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/MemberFeedback" style={{ "color": "white" }}>
                                    Give Feedback
                                </NavLink>
                            </li>
                        ) : null}

                        
    {userRole === "Member" ? (
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/ViewOwnFeedback" style={{ "color": "white" }}>
                                    View previous feedbacks
                                </NavLink>
                            </li>
                        ) : null}


                        {userRole === "Admin" ? (
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/CreateEvents" style={{ "color": "white" }}>
                                    Add event
                                </NavLink>
                            </li>
                        ) : null}


                        {userRole === "Member" || userRole === "Admin" ? (
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/ViewEvents" style={{ "color": "white" }}>
                                    View events
                                </NavLink>
                            </li>
                        ) : null}



                    </ul>

                    {token ? (
                        <button onClick={handleLogout} className="button-2"
                        >
                            Logout
                        </button>
                    ) : (
                        <button onClick={handleLogin} className="button-2"
                        >
                            Login
                        </button>
                    )}


                </div>
            </div>
        </nav >
    );
}
