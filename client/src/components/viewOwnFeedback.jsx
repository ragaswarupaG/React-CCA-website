/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import "/styles.css";



export default function ViewOwnFeedback() {
    const [feedbacks, setFeedbacks] = useState([]); //im soring my feedbacks here
    const [popup, setPopup] = useState(false)
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [form, setForm] = useState({ category: '', feedback: '', image: '' });
    const [replies, setReplies] = useState([]);
    const [replyid, setreplyid] = useState([]);
    const [viewReplyPopup, setViewReplyPopup] = useState(false);
    const [feedbackPopup, setfeedbackPopup] = useState(false);
    const [search, setSearch] = useState("");



    const token = sessionStorage.getItem("token");
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
                    throw new Error("Invalid token!");
                }

                const data = await response.json();
                console.log("Response Data:", data);

                
            if (data.role !== "Member") {
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



    const viewFeedback = async () => {
        try {
            const response = await fetch("http://localhost:5050/record/view-feedback", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch feedbacks");
            }

            const data = await response.json();
            console.log(data);
            setFeedbacks(data);

        } catch (error) {
            console.log(error)
        }
    };

    useEffect(() => {
        if (token) {
            viewFeedback();
        }
    }, [token]);


    console.log("here")
    console.log(feedbacks)




    const viewReplies = async (feedbackId) => {
        try {
            const response = await fetch(`http://localhost:5050/record/view-replies/${feedbackId}`, {
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
            console.log("Replies Data:", data);

            setReplies([...data.replies]);
            const replyIds = data.replies.map(reply => reply._id);
            setreplyid(replyIds);

            console.log("this is replies stored in the state");
            console.log(replies);
            openViewReplyPopup();

        } catch (error) {
            window.alert("Failed to get replies.");
            console.error(error);
        }
    };



    function validateForm() {

        if (!form.title || form.title.trim() === "") {
            alert("Please enter the feedback title.");
            return false;
        }

        if (form.title.length > 50) {
            alert("Feedback title should be less than 50 characters.");
            return false;
        }



        if (!form.feedback || form.feedback.trim() === "") {
            alert("Please enter your feedback.");
            return false;
        }

        if (form.feedback.length > 1500) {
            alert("Please make sure that the feedback is less than 1500 characters.");
            return false;
        }


        if (!form.improvement || form.improvement.trim() === "") {
            alert("Please enter something for improvement section.");
            return false;
        }

        return true
    }



    const openViewReplyPopup = () => {
        setViewReplyPopup(true);


    };

    const closeViewReplyPopup = () => {
        setViewReplyPopup(false);
        setSelectedFeedback(null);
    };


    const getFeedbacksByCategory = async (category) => {
        try {
            const response = await fetch(`http://localhost:5050/record/view-feedback/${category}`, {
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
            setFeedbacks(data);


        } catch (error) {
            window.alert("Failed to get feedback.");
            console.error(error);
        }
    };


    const getFeedbacksByStatus = async (status) => {
        try {
            const response = await fetch(`http://localhost:5050/record/view-feedback/admin-view-by-status/${status}`, {
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
            setFeedbacks(data);


        } catch (error) {
            window.alert("Failed to get feedback.");
            console.error(error);
        }
    };


    const viewFullFeedback = async (feedbackId) => {
        try {
            const response = await fetch(`http://localhost:5050/record/view-feedback/member-view-by-id/${feedbackId}`, {
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
            setSelectedFeedback(data);
            openFeedbackPopup(data);
            console.log("HERE");

            console.log(data);


        } catch (error) {
            window.alert("Failed to get feedbackkkkkkkkkkk.");
            console.error(error);
        }
    };
    const openFeedbackPopup = (feedback) => {
        setSelectedFeedback(feedback);
        setfeedbackPopup(true);
    };

    const closeFeedbackPopup = () => {
        setfeedbackPopup(false);
        setSelectedFeedback(null);
    };





    const deleteFeedback = async (feedbackId) => {
        const confirmation = window.confirm("Are you sure you want to delete this feedback?");
        if (!confirmation) {
            return;
        }

        try {
            const responseData = await fetch(`http://localhost:5050/record/view-feedback/${feedbackId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!responseData.ok) {
                const errorData = await responseData.json();
                window.alert(errorData.message);
                return;
            }

            window.alert("Deleted successfully!");
            setFeedbacks((prevFeedbacks) => prevFeedbacks.filter((item) => item._id !== feedbackId));
        } catch (error) {
            window.alert("Failed to delete feedback.");
            console.error(error);
        }
    };

    function removePic() {
        setForm((prev) => ({
            ...prev,
            image: "",
        }));
        document.getElementById("image").value = "";
    }

    const editFeedback = async (feedbackId) => {

        if (!validateForm()) {
            return;
        }



        const updatedFeedback = {
            title: form.title,
            category: form.category,
            feedback: form.feedback,
            rating: form.rating,
            improvement: form.improvement,
            image: form.image,
        };

        const confirmation = window.confirm("Are you sure you want to save the changes made to this post?");
        if (!confirmation) {
            return;
        }
        try {
            const responseData = await fetch(`http://localhost:5050/record/view-feedback/${feedbackId}`, {
                method: "PATCH",
                body: JSON.stringify(updatedFeedback),
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!responseData.ok) {
                const errorData = await responseData.json();
                window.alert(errorData.message);
                return;
            }

            window.alert("Updated details successfully!");

            setFeedbacks((prevFeedbacks) =>
                prevFeedbacks.map(feedback =>
                    feedback._id === feedbackId ? { ...feedback, ...updatedFeedback } : feedback
                )
            );

            closePopup();
        } catch (error) {
            window.alert("Failed to update feedback.");
            console.error(error);
        }
    };


    const openEditPopup = (feedback) => {
        console.log("hereeeeeeeee", feedback)
        setSelectedFeedback(feedback);
        setForm({ title: feedback.title, category: feedback.category, feedback: feedback.feedback, improvement: feedback.improvement, rating: feedback.rating, image: feedback.image });
        setPopup(true);
    };

    const closePopup = () => {
        setPopup(false);
        setSelectedFeedback(null);
        setForm({ title: "", category: '', feedback: '', rating: '', improvement: '', image: '' });

    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm((prevForm) => ({ ...prevForm, [name]: value }));
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

    const filteredFeedbacks = feedbacks.filter(feedback =>
        feedback.name.toLowerCase().includes(search.toLowerCase()) ||
        feedback.title.toLowerCase().includes(search.toLowerCase()) ||
        feedback.email.toLowerCase().includes(search.toLowerCase()) ||
        feedback.feedback.toLowerCase().includes(search.toLowerCase())

    );

    function updateForm(value) {
        return setForm((prev) => {
            return { ...prev, ...value };
        });
    }

    return (
        <div className="parentdiv">
            <div className="feedbackHeaders">
                <h2>Your previous feedbacks</h2>
                <p>We have read your needs, please continue to provide us with feedback to improve the experience for all!</p>
            </div>

            <form className="search-bar-feedback" onSubmit={(e) => e.preventDefault()}>
                <div className="custom-search-wrapper">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input
                        className="custom-search-input"
                        type="search"
                        placeholder="Search here!"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </form>





            <div className="buttonsDisplayCategory">
                <button onClick={viewFeedback} className="categoryButton">View All</button>
                <button onClick={() => getFeedbacksByCategory("GeneralFeedback")} className="categoryButton">General Feedback</button>
                <button onClick={() => getFeedbacksByCategory("Complaint")} className="categoryButton">Complaint</button>
                <button onClick={() => getFeedbacksByCategory("Query")} className="categoryButton">Query</button>
                <button onClick={() => getFeedbacksByCategory("Others")} className="categoryButton">Others</button>
                <button onClick={() => getFeedbacksByStatus("Read")} className="statusButton">Read</button>
                <button onClick={() => getFeedbacksByStatus("Unread")} className="statusButton">Unread</button>
                <button onClick={() => getFeedbacksByStatus("Replied")} className="statusButton">Replied</button>
            </div>



            {filteredFeedbacks.length > 0 ? (
                filteredFeedbacks.map((feedback, index) => (
                    <div key={index} className="dividerFeedback">
                        <div className="feedbackItem">
                            <div className="userRow">
                                <div className="userInfo">
                                    <span><b>{feedback.name}</b> | <b>{feedback.email}</b></span>
                                    <p>{new Date(feedback.time).toLocaleString()}</p>
                                </div>

                                <div className="actionButtons">
                                    <button className="view" onClick={() => viewFullFeedback(feedback._id)}>View</button>
                                    <button className="edit" onClick={() => openEditPopup(feedback)}>Edit</button>
                                    <button className="delete" onClick={() => deleteFeedback(feedback._id)}>Delete</button>
                                    <button className="view-replies" onClick={() => viewReplies(feedback._id)}>View Replies</button>

                                </div>
                            </div>

                            <hr className="divider" />


                            <div className="feedbackContent">

                                <div className="set1">

                                    <p><b>Title: </b>{feedback.title}</p>
                                    <p><b>Category: </b>{feedback.category}</p>
                                    <p> <b>Status: </b>{feedback.status}</p>

                                </div>



                                <div className="stars">
                                    <label htmlFor="rating"> <b> CCA Rating:</b></label>

                                    {[1, 2, 3, 4, 5].map((value) => (
                                        <label key={value}>
                                            <input
                                                type="radio" hidden
                                                name="rating"
                                                value={value}
                                                checked={feedback.rating === value}
                                            />
                                            <span className={`fa fa-star star ${feedback.rating >= value ? 'checked' : ''}`}></span>
                                        </label>
                                    ))}

                                </div>


                                <div className="set2">
                                    <p> <b>Improvements: </b>{feedback.improvement}</p>
                                    <p style={{ "padding-top": "5px" }}> <b>Feedback:</b>  {feedback.feedback}</p>

                                    {feedback.image && <img src={feedback.image} alt="Event" width="300" />}
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="dividerFeedback" style={{ textAlign: 'center', fontSize: '17px' }}>
                    <b>No feedbacks found, give one today!</b>
                </div>
            )}

            {popup && (
                <div className="popup">
                    <div className="popupContentEdit">
                        <h4 style={{ "padding": "10px" }}>Edit feedback</h4>


                        <form onSubmit={(e) => { e.preventDefault(); editFeedback(selectedFeedback._id); }}>
                            <div className="form-container-edit">

                                <label htmlFor="editFeedback"> <b>Feedback title:</b></label>
                                <input
                                    id="editFeedback"
                                    type="text"
                                    name="title"
                                    value={form.title}
                                    onChange={handleInputChange}
                                />

                                <label htmlFor="editFeedbackCategory"><b>Feedback Category:</b></label>


                                <select
                                    id="editFeedbackCategory"
                                    name="category"
                                    value={form.category || ""}
                                    required
                                    onChange={(e) => handleInputChange({ target: { name: "category", value: e.target.value } })}
                                >
                                    <option value="" disabled>Select feedback category</option>
                                    <option value="GeneralFeedback">General Feedback</option>
                                    <option value="Query">Query</option>
                                    <option value="Complaint">Complaint</option>
                                    <option value="Others">Others</option>
                                </select>



                                <label htmlFor="rating"><b>CCA Rating:</b></label>
                                <div className="rating" style={{ display: "flex" }}
                                >
                                    {[1, 2, 3, 4, 5].map((value) => (
                                        <label key={value} className="star-rating">
                                            <input
                                                type="radio" hidden
                                                name="rating"
                                                value={value}
                                                checked={form.rating === value}
                                                onChange={(e) => updateForm({ rating: Number(e.target.value) })}
                                            />
                                            <span className={`fa fa-star star ${form.rating >= value ? 'checked' : ''}`}></span>
                                        </label>
                                    ))}
                                </div>


                                <label htmlFor="editFeedback"><b>Feedback:</b></label>
                                <textarea
                                    id="editFeedback"
                                    name="feedback"

                                    value={form.feedback}
                                    onChange={handleInputChange}
                                />

                                <label htmlFor="editFeedback"><b>Improvements:</b></label>
                                <textarea
                                    id="editFeedback"
                                    type="text"
                                    name="improvement"

                                    value={form.improvement}
                                    onChange={handleInputChange}
                                />


                                <label ><b>Current image:</b></label>
                                {/* {form.image && <img src={form.image} alt="Event" width="200" />} */}
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
                                    type="file"
                                    onChange={handleImageChange}
                                />

                            </div>

                            <div className="savebutton">
                                <button className="saveChanges" type="submit">Save changes</button>
                            </div>

                            <button className="closeIcon" type="button" onClick={closePopup}>
                                <i className="fas fa-times"></i>
                            </button>
                        </form>
                    </div>
                </div>
            )}



            {feedbackPopup && selectedFeedback && (
                <div className="popupView">
                    <div className="popupContentView">

                        <h4 style={{ "padding": "10px" }}>Feedback Details</h4>

                        <div
                            className="userDetails"
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <p>{selectedFeedback.name} | {selectedFeedback.email}</p>
                            <p>{new Date(selectedFeedback.time).toLocaleString()}</p>
                        </div>


                        <div className="mainContent">
                            <p className="titleOfFeedback"><strong>Title:</strong> {selectedFeedback.title}</p>
                            <p className="mainFeedback"> <strong>Feedback:</strong> {selectedFeedback.feedback}</p>
                            <p className="mainFeedback"> <strong>Improvements:</strong> {selectedFeedback.improvement}</p>

                        </div>


                        <button onClick={closeFeedbackPopup} className="closePopupFeedback">Close</button>
                    </div>
                </div>
            )}


            {viewReplyPopup && (
                <div className="popup">

                    <div className="popupContentReply">

                        <div>

                            <div >

                                <h3 className="titleReply">Replies</h3>
                                <p className="titleReply">We have carefully looked through and understood your feedback. Please reach back to us if you need further assistance.</p>
                                <hr />

                            </div>
                            {replies.length > 0 ? (
                                replies.map((reply, index) => (
                                    <div key={index} className="replyContent">
                                        <p><b>{reply.adminEmail} | {reply.adminName}</b>: {reply.reply}</p>
                                    </div>
                                ))
                            ) : (
                                <p>No replies found.</p>
                            )}
                        </div>

                        <div className="buttonplace">
                            <button onClick={closeViewReplyPopup} className="closeReply">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

















