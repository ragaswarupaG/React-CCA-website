/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, startTransition } from "react";
import { useNavigate } from "react-router";


export default function ViewSignedUpEvents() {
    const token = sessionStorage.getItem('token');
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(false);


    const [popup, setPopup] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState(null);

    const [editPopup, setEditPopup] = useState(false);

    const [form, setForm] = useState({
        equipment: "",
        previousInjuries: "",
        medicalCondition: "",
        emergencyName: "",
        emergencyContact: "",
    });


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


                if (role !== "Member") {
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


    function updateForm(value) {
        return setForm((prev) => {
            return { ...prev, ...value };
        });
    }



    async function fetchEvents() {
        try {
            const response = await fetch("http://localhost:5050/record/joined-events", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                window.alert(errorData.message);
                return;
            }

            const eventData = await response.json();
            console.log("Fetched Events:", eventData);
            setEvents(eventData);

        } catch (error) {
            console.error("Error fetching events:", error);
        }
    }
    useEffect(() => {
        fetchEvents();
    }, []);





    async function editSignup(eventId) {



        const confirmation = window.confirm("Are you sure you want to save the changes made to your application?");
        if (!confirmation) {
            return;
        }

        const editedEvent = {
            equipment: form.equipment,
            previousInjuries: form.previousInjuries,
            medicalCondition: form.medicalCondition,
            emergencyName: form.emergencyName,
            emergencyContact: form.emergencyContact,

        };

        const responseData = await fetch(`http://localhost:5050/record/application/${eventId}`, {
            method: "PATCH",
            body: JSON.stringify(editedEvent),
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!responseData.ok) {
            const errorData = await responseData.json();
            window.alert(errorData.message);
            return;
        }

        window.alert('Updated details successfully!');

        closeEditPopup()
    }




    const viewFullEventDetail = async (eventId) => {
        try {
            const response = await fetch(`http://localhost:5050/record/get-event/${eventId}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("Received Event ID:", eventId);

            if (!response.ok) {
                const errorData = await response.json();
                window.alert(errorData.message);
                return;
            }

            const data = await response.json();
            setSelectedEvent(data);
            openEventPopup(data);
            console.log(data);


        } catch (error) {
            window.alert("Failed to get event details.");
            console.error(error);
        }
    };
    const openEventPopup = (feedback) => {
        setSelectedEvent(feedback);
        setPopup(true);
    };

    const closeEventPopup = () => {
        setPopup(false);
        setSelectedEvent(null);
    };



    const deleteSignup = async (eventId) => {

        const confirmation = window.confirm("Are you sure you want to withdraw from this event?");
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

            window.alert("Withdrawn successfully!")
            fetchEvents()

        } catch (error) {
            window.alert("Failed to withdraw from event.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };




    const openEditPopup = (signup) => {

        console.log(signup)
        setSelectedEvent(signup);
        setForm({

            equipment: signup.equipment,
            previousInjuries: signup.previousInjuries,
            medicalCondition: signup.medicalCondition,
            emergencyName: signup.emergencyName,
            emergencyContact: signup.emergencyContact,

        });
        setEditPopup(true);
    };

    const closeEditPopup = () => {
        setEditPopup(false);
        window.location.reload()
        setSelectedEvent(null);
    };





    return (


        <div className="containerEvents">
            <div className="title">
                <h2 >Events you have signed up for</h2>
                            {loading && <p>Loading, Please wait...</p>}

            </div>

            <div className="eventDisplayed">

                {events.length > 0 ? (
                    events.map((event) => (
                        <div key={event._id} className="eventCard">
                            <img src={event.image} alt="Event" className="eventImage" />
                            <div className="eventInfo">
                                <h4 className="eventDetails">{event.name}</h4>
                                <p className="eventDetailsLocation">{event.location}</p>
                                <p className="eventDetails">{event.date}</p>
                                <span className="eventDetails">{event.startTime} - {event.endTime}</span>
                                <hr />

                            </div>
                            <button className="event-button" onClick={() => viewFullEventDetail(event.eventId)}>View Details</button>
                  
                         

                            {token && userRole === "Member" && (
                                <div className="actionBUTTONS">
                                    <button onClick={() => openEditPopup(event)} className="EDIT">
                                        Edit sign up form
                                    </button>
                                    <button onClick={() => deleteSignup(event._id)} className="withdraw" disabled={loading}>
                                        Withdraw sign up
                                    </button>
                                </div>
                            )}

                        </div>
                    ))
                ) : (
                    <p>No events found.</p>
                )}
            </div>


            {popup && (
                <div className="popup">
                    <div className="popupContentViewEventDetails">
                        <h2>Event details</h2>

                        <div className="form-container-view-event-details">
                            <label htmlFor="editFeedbackCategory">Event Name:</label>
                            <input
                                className="form-control"
                                disabled
                                id="editFeedbackCategory"
                                type="text"
                                name="category"
                                value={selectedEvent.name}
                            />

                        </div>


                        <div className="form-container-view-event-details">

                            <label htmlFor="editFeedbackCategory">Event location:</label>
                            <input
                                disabled
                                className="form-control"

                                id="editFeedbackCategory"
                                type="text"
                                name="category"
                                value={selectedEvent.location}
                            />

                        </div>


                        <div className="form-container-view-event-details">

                            <label htmlFor="editFeedbackCategory">Event date:</label>
                            <input
                                disabled
                                className="form-control"

                                id="editFeedbackCategory"
                                type="text"
                                name="category"
                                value={selectedEvent.date}
                            />
                        </div>

                        <div className="form-container-view-event-details">

                            <label htmlFor="editFeedbackCategory">Event description:</label>
                            <textarea
                                disabled
                                id="editFeedbackCategory"
                                className="form-control"

                                type="text"
                                name="category"
                                value={selectedEvent.description}
                            />
                        </div>


                        <div className="form-container-view-event-details">
                            <label htmlFor="editFeedbackCategory">Event start time:</label>
                            <input
                                disabled
                                id="editFeedbackCategory"
                                className="form-control"

                                type="text"
                                name="category"
                                value={selectedEvent.startTime}
                            />
                        </div>




                        <div className="form-container-view-event-details">
                            <label htmlFor="editFeedbackCategory">Event end time:</label>
                            <input
                                disabled
                                id="editFeedbackCategory"
                                type="text"
                                className="form-control"

                                name="category"
                                value={selectedEvent.endTime}
                            />
                        </div>

        
                        <div className="form-container-view-event-details">
                            <label htmlFor="editFeedbackCategory">Event in charge contact number:</label>
                            <input
                                disabled
                                id="editFeedbackCategory"
                                type="text"
                                className="form-control"
                                name="category"
                                value={selectedEvent.contact}
                            />
                        </div>

                        <div className="form-container-view-event-details">
                            <label htmlFor="editFeedbackCategory">Last date to register:</label>
                            <input
                                disabled
                                className="form-control"

                                id="editFeedbackCategory"
                                type="text"
                                name="category"
                                value={selectedEvent.closingDate}
                            />
                        </div>


                        <div className="buttonsEvents" style={{ "padding-top": "20px" }}>
                            <button onClick={closeEventPopup} className="closeevents" > close </button>
                        </div>
                    </div>
                </div>
            )}



            {editPopup && (
                <div className="popup">
                    <div className="popupContentEditSignupForm">
                        <h2>Edit Signup Form</h2>


                        <form>
                            <div className="editFormDIV">
                                <label htmlFor="equipment">Bringing your own equipment?:</label>

                                <select
                                    className="form-control"
                                    value={form.equipment}
                                    onChange={(e) => updateForm({ equipment: e.target.value })}
                                >
                                    <option value="">Select an option</option>
                                    <option value="true">Yes</option>
                                    <option value="false">No</option>
                                </select> <br />
                            </div>


                            <div className="editFormDIV">
                                <label htmlFor="name">Previous injuries?:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={form.previousInjuries}
                                    onChange={(e) => updateForm({ previousInjuries: e.target.value })}
                                /> <br />
                            </div>


                            <div className="editFormDIV">
                                <label htmlFor="name">Medical Condition?:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={form.medicalCondition}
                                    onChange={(e) => updateForm({ medicalCondition: e.target.value })}
                                /> <br />
                            </div>



                            <div className="editFormDIV">

                                <label htmlFor="name">Emergency Name:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={form.emergencyName}
                                    onChange={(e) => updateForm({ emergencyName: e.target.value })}
                                /> <br />
                            </div>


                            <div className="editFormDIV">

                                <label htmlFor="name">Emergency contact:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={form.emergencyContact}
                                    onChange={(e) => updateForm({ emergencyContact: e.target.value })}
                                /> <br />
                            </div>


                        </form>

                        <div className="actionBUTTONS">
                            <button onClick={() => editSignup(selectedEvent.eventId)} className="EDITBTN">Save Changes</button>
                            <button onClick={closeEditPopup} className="CLOSE">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
