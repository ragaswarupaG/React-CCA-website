// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, startTransition } from "react";
import { useNavigate } from "react-router";


export default function CreateEvents() {
    const token = sessionStorage.getItem('token');
    const navigate = useNavigate();

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


    const [form, setForm] = useState({
        name: "",
        location: "",
        date: "",
        description: "",
        closingDate: "",
        startTime: "",
        endTime: "",
        limit: "",
        contact: "",
        image: "",
    });



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
        const closingDate = new Date(form.closingDate).toISOString().split('T')[0];


        if (eventDate < today) {
            alert("Event date should be in the future.");
            return false;
        }


        if (closingDate > eventDate) {
            alert("Registration should close before the event begins.");
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



        if (closingDate < today) {
            alert("Registration closing date should be in the future.");
            return false;
        }


        if (form.startTime > form.endTime) {
            alert("Enter a valid start and end time duration for your event.");
            return false;
        }

        if (!form.limit || form.limit.trim() === "") {
            alert("Please enter the number of available slots.");
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

    function removePic() {
        setForm((prev) => ({
            ...prev,
            image: "",
        }));
        document.getElementById("image").value = "";
    }
    async function onSubmit(e) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const confirmation = window.confirm("Are you sure you want to add this event?");
        if (!confirmation) {
            return;
        }

        const newEvent = { ...form };

        const response = await fetch("http://localhost:5050/record/add-events", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(newEvent),

        })

        if (!response.ok) {

            const errorData = await response.json();
            window.alert(errorData.message)
            return

        }

        alert("Event added successfully!");


        setForm({
            name: "",
            location: "",
            date: "",
            description: "",
            closingDate: "",
            startTime: "",
            endTime: "",
            limit: "",
            contact: "",
            image: "",
        });
        navigate("/");
    }


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


    return (


        <div className="eventContainer">
            <h3>Add a new event!</h3>
            <form onSubmit={onSubmit}>
                <div className="form-group-add-events">
                    <label htmlFor="name">Event Name</label>
                    <input
                        type="text"
                        className="form-control"
                        id="name"
                        placeholder="Enter the event's name"
                        value={form.name}
                        required
                        onChange={(e) => updateForm({ name: e.target.value })}
                    />
                </div>

                <div className="form-group-add-events">
                    <label htmlFor="location">Location</label>
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
                </div>


                <div className='form-group-add-events'>
                    <label htmlFor="date">Event Date</label>
                    <input
                        type="date"
                        className="form-control"
                        id="date"
                        value={form.date}
                        required
                        onChange={(e) => updateForm({ date: e.target.value })}
                    />
                </div>

                <div className='form-group-add-events'>
                    <label htmlFor="description">Description</label>
                    <textarea
                        className="form-control"
                        placeholder="Describe the event!"
                        id="description"
                        value={form.description}
                        required
                        onChange={(e) => updateForm({ description: e.target.value })}
                    />
                </div>

                <div className="form-group-add-events">
                    <label htmlFor="closingDate">Registration Closing Date</label>
                    <input
                        type="date"
                        className="form-control"
                        id="closingDate"
                        value={form.closingDate}
                        required
                        onChange={(e) => updateForm({ closingDate: e.target.value })}
                    />
                </div>

                <div className="form-group-add-events">
                    <label htmlFor="startTime">Start Time</label>
                    <input
                        type="time"
                        className="form-control"
                        id="startTime"
                        value={form.startTime}
                        required
                        onChange={(e) => updateForm({ startTime: e.target.value })}
                    />
                </div>

                <div className="form-group-add-events">
                    <label htmlFor="endTime">End Time</label>
                    <input
                        type="time"
                        className="form-control"
                        id="endTime"
                        value={form.endTime}
                        required
                        onChange={(e) => updateForm({ endTime: e.target.value })}
                    />
                </div>

                <div className="form-group-add-events">
                    <label htmlFor="limit">Number of slots available</label>
                    <input
                        type="number"
                        className="form-control"
                        id="limit"
                        value={form.limit}
                        required
                        onChange={(e) => updateForm({ limit: e.target.value })}
                    />
                </div>

                <div className="form-group-add-events">
                    <label htmlFor="contact">Contact Information</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Enter a mobile number for further contact information or emergency"
                        id="contact"
                        value={form.contact}
                        required
                        onChange={(e) => updateForm({ contact: e.target.value })}
                    />
                </div>


                <div className="form-group-add-events">
                    <label htmlFor="image">Event Image</label>
                    <input
                        type="file"
                        className="form-control"
                        id="image"
                        onChange={handleImageChange}
                    />
                    {form.image && (
                        <div>
                            <img src={form.image} />
                            <button
                                type="button"
                                onClick={removePic}
                            >
                                Remove
                            </button>
                        </div>
                    )}
                </div>





<div className="form-group-add-events">
    <div className="submitEventAlignement">
    <input
                    type="submit"
                    value="Create Event"
                    className="eventButton"
                />
    </div>
</div>
            </form>
        </div>
    );
}
