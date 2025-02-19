// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { NavLink } from "react-router-dom";

export default function ViewEvents() {
    const token = sessionStorage.getItem("token");
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(null);
    const [events, setEvents] = useState([]);
    const [popup, setPopup] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [editPopup, setEditPopup] = useState(false);
    const [loading, setLoading] = useState(false);
    const [joinedEvents, setJoinedEvents] = useState([]);



    const [form, setForm] = useState({
        name: "",
        date: "",
        description: "",
        closingDate: "",
        startTime: "",
        endTime: "",
        contact: "",
        location: "",
        limit: "",
        image: ""
    });

    const [signupPopup, setSignupPopup] = useState(false);
    const [signupForm, setSignupForm] = useState({
        equipment: "false",
        previousInjuries: "",
        medicalCondition: "",
        emergencyName: "",
        emergencyContact: "",
    });


    useEffect(() => {
        async function fetchJoinedEvents() {
            try {
                const response = await fetch("http://localhost:5050/record/joined-events", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                    },
                });

                if (!response.ok) {
                    console.error("Failed to fetch joined events");
                    return;
                }

                const data = await response.json();
                setJoinedEvents(data);
                console.log("HERE")
                console.log(joinedEvents)
            } catch (error) {
                console.error("Error fetching joined events:", error);
            }
        }

        fetchJoinedEvents();
    }, []);



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
                    window.location.reload();
                    throw new Error("Invalid token!");
                }

                const data = await response.json();
                console.log("Response Data:", data);

                console.log("User Role:", data.role);
                setUserRole(data.role);


            } catch (error) {
                console.error("Invalid token:", error.message);
                sessionStorage.removeItem("token");
                navigate("/");
            }
        };

        validateToken();
    }, [token, navigate]);






    async function fetchEvents() {
        try {
            const response = await fetch("http://localhost:5050/record/get-all-events", {
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




    function updateForm(value) {
        return setForm((prev) => {
            return { ...prev, ...value };
        });
    }


    function validateForm() {

        if (!form.name || form.name.trim() === "") {
            alert("Please enter the event name.");
            return false;
        }

        if (form.name.length > 50) {
            alert("Event name should be less than 50 characters.");
            return false;
        }


        const today = new Date().toISOString().split('T')[0];
        const eventDate = new Date(form.date).toISOString().split('T')[0];

        if (eventDate < today) {
            alert("Event date should be in the future.");
            return false;
        }



        if (!form.description || form.description.trim() === "") {
            alert("Please enter the event description.");
            return false;
        }

        if (form.description.length > 1500) {
            alert("Please make sure that the event description is less than 1500 characters.");
            return false;
        }


        const closingDate = new Date(form.closingDate).toISOString().split('T')[0];

        if (closingDate < today) {
            alert("Registration closing date should be in the future.");
            return false;
        }


        if (form.startTime > form.endTime) {
            alert("Enter a valid start and end time duration for your event.");
            return false;
        }

        if (!form.limit ) {
            alert("Please enter the number of slots available.");
            return false;
        }

        if (form.limit > 200) {
            alert("The limit for members should be less than 200.");
            return false;
        }

        if (!form.contact || form.contact.trim() === "") {
            alert("Please enter the contact details (SG mobile number).");
            return false;
        }

        if (form.contact.length > 8) {
            alert("Please enter a valid contact details with 8 digits only (SG mobile number).");
            return false;
        }

        if (form.contact.length < 8) {
            alert("Please enter a valid contact details with 8 digits only (SG mobile number).");
            return false;
        }

        return true

    }



    function validateSignupForm() {
        const nameRegex = /^[a-zA-Z\s]+$/;


        if (!signupForm.previousInjuries || signupForm.previousInjuries.trim() === "") {
            alert("Please enter the details of your previous injuries. If none please type NIL");
            return false;
        }

        if (!signupForm.medicalCondition || signupForm.medicalCondition.trim() === "") {
            alert("Please enter the details of your medical condition. If none please type NIL");
            return false;
        }

        if (!signupForm.emergencyName || signupForm.emergencyName.trim() === "") {
            alert("Please enter the name of a person we can contact in case of emergency. If none please type NIL");
            return false;
        }

        if (!nameRegex.test(signupForm.emergencyName.trim()) || signupForm.emergencyName.length > 50) {
            alert("Name should only contain alphabets, and must be less than 50 characters.");
            return false;
        }

        if (signupForm.emergencyContact.length > 8) {
            alert("Please make sure that your emergency contact number is 8 digits only (Singapore mobile number).");
            return false;
        }

        if (signupForm.emergencyContact.length < 8) {
            alert("Please make sure that your emergency contact number is 8 digits only (Singapore mobile number).");
            return false;
        }
        return true
    }

    async function editEvent(eventId) {

        if (!validateForm()) {
            return;
        }


        const confirmation = window.confirm("Are you sure you want to save the changes made to this event?");
        if (!confirmation) {
            return;
        }

        const editedEvent = {
            name: form.name,
            location: form.location,
            date: form.date,
            description: form.description,
            closingDate: form.closingDate,
            startTime: form.startTime,
            endTime: form.endTime,
            limit: form.limit,
            contact: form.contact,
            image: form.image,
        };

        const responseData = await fetch(`http://localhost:5050/record/get-event/${eventId}`, {
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
        window.location.reload()
    }




    const deleteEvent = async (eventId) => {

        const confirmation = window.confirm("Are you sure you want to delete this event?");
        if (!confirmation) {
            return;
        }


        try {
            const response = await fetch(`http://localhost:5050/record/get-event/${eventId}`, {
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

            window.alert("Event is deleted successfully!")
            fetchEvents()

        } catch (error) {
            window.alert("Failed to get delete event.");
            console.error(error);
        }
    };






    const signupForEvent = async (eventId) => {

        if (!validateSignupForm()) {
            return;
        }

        const confirmation = window.confirm("Are you sure you want to sign up for this event?");
        if (!confirmation) {
            return;
        }
        setLoading(true);

        try {
            const responseData = await fetch(`http://localhost:5050/record/join-events/${eventId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...signupForm,
                }


                ),

            });

            if (!responseData.ok) {
                const errorData = await responseData.json();
                window.alert(errorData.message);
                return;
            }

            window.alert("Signed up successfully, check your email!");
            sessionStorage.setItem(eventId, 'Joined');



            closeSignupPopup();

        } catch (error) {
            window.alert("Failed to sign up.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    const openSignupPopup = () => {
        setSignupPopup(true);
    };

    const closeSignupPopup = () => {
        setSignupPopup(false);
        window.location.reload()
    };







    const viewFullEventDetail = async (eventId) => {
        try {
            const response = await fetch(`http://localhost:5050/record/get-event/${eventId}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

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





    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onloadend = () => {
                const base64Image = reader.result;
                updateForm({ image: base64Image });
            };

            reader.readAsDataURL(file);
        }
    };



    const openEditPopup = (event) => {

        console.log(event)
        setSelectedEvent(event);
        setForm({
            name: event.name,
            date: event.date,
            description: event.description,
            closingDate: event.closingDate,
            startTime: event.startTime,
            endTime: event.endTime,
            contact: event.contact,
            limit: event.limit,
            location: event.location,
            image: event.image
        });
        setEditPopup(true);
    };

    const closeEditPopup = () => {
        setEditPopup(false);
        setSelectedEvent(null);
    };



    function eventExpired(closingDate) {
        const today = new Date();
        const eventClosingDate = new Date(closingDate);

        return today > eventClosingDate;


    }

    function removePic() {
        setForm((prev) => ({
            ...prev,
            image: "",
        }));
        document.getElementById("image").value = "";
    }



    return (



        <div className="containerEvents">


            <div className="title">
                <h2 >All Events</h2>
                <p >Join us for exciting and interactive sessions where you can stay active, have fun, and connect with new friends</p>
            </div>


            {token && userRole === "Member" && (
                <NavLink to="/ViewSignedupEvents" className={"viewSignedupEvents"}>
                    View Signed up events!
                </NavLink>
            )}


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

                                <p className="eventDetails">{event.limit} slots available</p>
                            </div>




                            <button
                                className={`event-button ${eventExpired(event.closingDate) || event.limit === 0 ? 'disabled' : ''}`}
                                onClick={() => viewFullEventDetail(event._id)}
                                disabled={eventExpired(event.closingDate) || event.limit === 0}
                            >
                                {eventExpired(event.closingDate)
                                    ? 'Registration Closed'
                                    : event.limit === 0
                                        ? 'Slots Full'
                                        : joinedEvents.some(joinedEvent => joinedEvent.eventId === event._id)
                                            ? 'Joined Already'
                                            : 'View Details'}
                            </button>

                            {token && userRole === "Admin" && (

                                <div>
                                    <div className="signupButton">
                                        <NavLink
                                            className="ViewsignupsLink"
                                            to="/ViewTotalSignups"
                                            state={{ eventName: event.name, eventDate: event.date, eventId: event._id }}>
                                            View signups
                                        </NavLink>
                                    </div>
                                </div>
                            )}


                            {token && userRole === "Admin" && (

                                <div>
                                    <div className="adminButtons">
                                        <button onClick={() => deleteEvent(event._id)} className="deleteEvent">Delete</button>
                                        <button onClick={() => openEditPopup(event)} className="editEvent">Edit</button>
                                    </div>
                                </div>
                            )}

                        </div>
                    ))
                ) : (
                    <p>No events found.</p>
                )}
            </div>




            {
                popup && (
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

                            <label htmlFor="editFeedbackCategory">Number of slots left:</label>
                                <input
                                    disabled
                                    id="editFeedbackCategory"
                                    className="form-control"
                                    type="text"
                                    name="category"
                                    value={selectedEvent.limit}
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




                            <p style={{ "padding-top": "30px" }}>Event is still open! Join us now</p>



                            <div className="buttonsEvents">

                                <button onClick={openSignupPopup} className="signupButtonForEvent" >Sign up for the event</button>
                                <button onClick={closeEventPopup} className="closeevents"> close </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                editPopup && (
                    <div className="popup">
                        <div className="popupContentEditEvent">
                            <h2>Edit Event</h2>
                            <form>
                                <div className="editDetailsDIV">
                                    <label htmlFor="name">Event name:</label>
                                    <input
                                        type="text"
                                        id="name"
                                        className="form-control"
                                        placeholder="Name"
                                        value={form.name}
                                        onChange={(e) => updateForm({ name: e.target.value })}
                                    /> <br />

                                </div>


                                <div className="editDetailsDIV">

                                    <label htmlFor="name">Event date:</label>
                                    <input
                                        type="date"
                                        placeholder="Date"
                                        className="form-control"

                                        value={form.date}
                                        onChange={(e) => updateForm({ date: e.target.value })}
                                    /> <br />
                                </div>



                                <div className="editDetailsDIV">

                                    <label htmlFor="name">Event description:</label>

                                    <textarea
                                        placeholder="Description"
                                        className="form-control"

                                        value={form.description}
                                        onChange={(e) => updateForm({ description: e.target.value })}
                                    /> <br />
                                </div>



                                <div className="editDetailsDIV">

                                    <label htmlFor="name">Regisration closing date:</label>

                                    <input
                                        type="date"
                                        className="form-control"

                                        placeholder="Closing Date"
                                        value={form.closingDate}
                                        onChange={(e) => updateForm({ closingDate: e.target.value })}
                                    /> <br />
                                </div>


                                <div className="editDetailsDIV">

                                    <label htmlFor="name">Event start time:</label>

                                    <input
                                        type="time"
                                        className="form-control"

                                        placeholder="Start Time"
                                        value={form.startTime}
                                        onChange={(e) => updateForm({ startTime: e.target.value })}
                                    /> <br />
                                </div>

                                <div className="editDetailsDIV">

                                    <label htmlFor="name">Event end time:</label>

                                    <input
                                        type="time"
                                        placeholder="End Time"
                                        className="form-control"

                                        value={form.endTime}
                                        onChange={(e) => updateForm({ endTime: e.target.value })}
                                    /> <br />
                                </div>



                                <div className="editDetailsDIV">

                                    <label htmlFor="name">Event contact number:</label>

                                    <input
                                        type="number"
                                        placeholder="Contact"

                                        className="form-control"


                                        value={form.contact}
                                        onChange={(e) => updateForm({ contact: e.target.value })}
                                    /> <br />
                                </div>


                                <div className="editDetailsDIV">
                                    <label htmlFor="name">Event location:</label>
                                    <select
                                        className="form-control"
                                        id="location"
                                        value={form.location}
                                        required
                                        onChange={(e) => updateForm({ location: e.target.value })}
                                    >
                                        <option value="">Select a location</option>
                                        <option value="Temasek Polytechnic East Wing Sports Hall 1">
                                            Temasek Polytechnic East Wing Sports Hall 1
                                        </option>
                                        <option value="Temasek Polytechnic East Wing Sports Hall 2">
                                            Temasek Polytechnic East Wing Sports Hall 2
                                        </option>
                                        <option value="Temasek Polytechnic East Wing Outdoor Basketball Court">
                                            Temasek Polytechnic East Wing Outdoor Basketball Court
                                        </option>
                                        <option value="Temasek Polytechnic East Wing Outdoor Sports Hall 1">
                                            Temasek Polytechnic East Wing Outdoor Sports Hall 1
                                        </option>
                                    </select>
                                    <br />
                                </div>



                                <div className="editDetailsDIV">

                                    <label htmlFor="name">Number of slots left:</label>
                                    <input
                                        type="text"
                                        placeholder="limit"
                                        className="form-control"

                                        value={form.limit}
                                        onChange={(e) => updateForm({ limit: e.target.value })}
                                    /> <br />
                                </div>




                                <div className="editDetailsDIV">

                                    <label ><b>Current image:</b></label>
                                    {form.image && (
                                        <>
                                            <img src={form.image} />
                                            <div>
                                                <button
                                                    type="button"
                                                    onClick={removePic}
                                                    style={{ backgroundColor: "#c70000", color: "white", border: "none", padding: "7px", margin: "10px", borderRadius: "5px" }}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </>
                                    )}


                                    <label htmlFor="editFeedbackImage" style={{ "padding-top": "20px" }}><b>Upload a new image:</b></label>
                                    <input
                                        id="editFeedbackImage"
                                        type="file" className="form-control"

                                        onChange={handleImageChange}
                                    />





                                    <br />
                                </div>

                            </form>


                            <div className="buttonsEvents">

                                <button onClick={() => editEvent(selectedEvent._id)} className="signupButtonForEvent" >Save Changes</button>
                                <button onClick={closeEditPopup} className="closeevents">Cancel</button></div>

                        </div>


                        <div className="buttonsEvents">

                        </div>

                    </div>
                )
            }






            {
                signupPopup && (
                    <div className="popup">
                        <div className="popupContentSignUp">
                            <h2>Sign up for this event!</h2>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                signupForEvent(selectedEvent._id);
                            }}>


                                <div className="signupDIV">
                                    <label htmlFor="equipment">Will you be bringing your own equipment?</label>
                                    <select
                                        id="equipment"
                                        name="equipment"
                                        className="form-control"
                                        value={signupForm.equipment}
                                        onChange={(e) => setSignupForm({
                                            ...signupForm,
                                            equipment: e.target.value
                                        })}
                                    >
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                    </select>
                                </div>



                                <div className="signupDIV">
                                    <label htmlFor="previousInjuries">Previous Injuries</label>
                                    <input
                                        type="text"
                                        className="form-control"

                                        id="previousInjuries"
                                        name="previousInjuries"
                                        value={signupForm.previousInjuries}
                                        onChange={(e) => setSignupForm({
                                            ...signupForm,
                                            previousInjuries: e.target.value
                                        })}
                                        placeholder="Describe any previous injuries"
                                    />
                                </div>

                                <div className="signupDIV">
                                    <label htmlFor="medicalCondition">Medical Condition</label>
                                    <input
                                        type="text"
                                        id="medicalCondition"
                                        className="form-control"

                                        name="medicalCondition"
                                        value={signupForm.medicalCondition}
                                        onChange={(e) => setSignupForm({
                                            ...signupForm,
                                            medicalCondition: e.target.value
                                        })}
                                        placeholder="Enter any known medical conditions"
                                    />
                                </div>

                                <div className="signupDIV">
                                    <label htmlFor="emergencyName">Emergency Contact Name</label>
                                    <input
                                        type="text"
                                        id="emergencyName"
                                        name="emergencyName"
                                        className="form-control"

                                        value={signupForm.emergencyName}
                                        onChange={(e) => setSignupForm({
                                            ...signupForm,
                                            emergencyName: e.target.value
                                        })}
                                        placeholder="Name"
                                    />
                                </div>

                                <div className="signupDIV">
                                    <label htmlFor="emergencyContact">Emergency Contact Number</label>
                                    <input
                                        type="tel"
                                        id="emergencyContact"
                                        className="form-control"

                                        name="emergencyContact"
                                        value={signupForm.emergencyContact}
                                        onChange={(e) => setSignupForm({
                                            ...signupForm,
                                            emergencyContact: e.target.value
                                        })}
                                        placeholder="Number"
                                    />
                                </div>


                                <div className="btnDIV">

                                    <button type="submit" className="signUPBTN" disabled={loading} >
                                        {loading ? "Loading, Please wait..." : "Sign up for the event"}
                                    </button>
                                    <button type="button" onClick={closeSignupPopup} className="CLOSE">Cancel</button></div>



                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
}