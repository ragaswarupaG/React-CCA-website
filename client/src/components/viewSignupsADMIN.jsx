/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, startTransition } from "react";
import { useNavigate } from "react-router";
import { useLocation } from 'react-router-dom';


export default function ViewTotalSignups() {
    const token = sessionStorage.getItem('token');
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const { eventName, eventDate, eventId } = location.state || {};

    console.log(eventName, eventDate, eventId);

    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                navigate("/");
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

                const { role } = data;
                setUserRole(data.role);


                if (role !== "Admin") {
                    navigate("/");
                    return
                }

            } catch (error) {
                console.error("Invalid token:", error.message);
                sessionStorage.removeItem("token");
                navigate("/");
            }
        };
        validateToken();
    }, [token, navigate]);




    const deleteSignup = async (eventId) => {

        const confirmation = window.confirm("Are you sure you want to remove this member from the event?");
        if (!confirmation) {
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`http://localhost:5050/record/application/${eventId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                window.alert(errorData.message);
                return;
            }

            window.alert("Removed successfully!")
            window.location.reload()
            fetchEvents()

        } catch (error) {
            window.alert("Failed to remove from event.");
            console.error(error);
        } finally{
            setLoading(false)
        }
    };


    async function fetchEvents() {
        try {
            const response = await fetch(`http://localhost:5050/record/View-Signups-By-Event/${eventId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.log(errorData)
                return;
            }

            const eventData = await response.json();
            setEvents(eventData);

        } catch (error) {
            console.error("Error fetching events:", error);
        }
    }
    useEffect(() => {
        fetchEvents();
    }, []);






    return (


        <div className="containerEvents">
            <div className="title">
                <h2 >View sign ups</h2>
                <hr />
                {loading && <p>Loading, Please wait...</p>}

                <h3 > {eventName}</h3>
                <b>{eventDate}</b>
            </div>


            <div className="signupsDisplayed">
                {events.length > 0 ? (
                    <table className="records-table">
                        <thead>
                            <tr>
                                <th>User Name</th>
                                <th>Email</th>
                                <th>Equipment</th>
                                <th>Medical Condition</th>
                                <th>Previous Injuries</th>
                                <th>Emergency Contact Name</th>
                                <th>Emergency Contact Number</th>
                                {token && userRole === "Admin" ? (
                                    <th>Action</th>
                                ) :
                                    <></>

                                }
                            </tr>
                        </thead>
                        <tbody>
                            {events.map((event) => (
                                <tr key={event._id}>
                                    <td>{event.userName}</td>
                                    <td>{event.email}</td>
                                    <td>{event.equipment ? "Yes" : "No"}</td>
                                    <td>{event.medicalCondition}</td>
                                    <td>{event.previousInjuries}</td>
                                    <td>{event.emergencyName}</td>
                                    <td>{event.emergencyContact}</td>

                                    <td>
                                        {token && userRole === "Admin" && (
                                            <>
                                                <button className="removeMemberADMIN" onClick={() => deleteSignup(event._id)}> Remove Member</button>

                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No signups found.</p>
                )}
            </div>

        </div>
    )
}
