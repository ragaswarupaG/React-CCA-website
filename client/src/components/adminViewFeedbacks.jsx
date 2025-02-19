/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import "/styles.css";


export default function AdminViewFeedbacks() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [popup, setPopup] = useState(false);
    const [feedbackPopup, setfeedbackPopup] = useState(false);
    const [replies, setReplies] = useState([]);
    const [replyid, setreplyid] = useState([]);
    const [viewReplyPopup, setViewReplyPopup] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [replyContent, setReplyContent] = useState("");
        const [loading, setLoading] = useState(false);
    
    const [search, setSearch] = useState("");



    const navigate = useNavigate();
    const token = sessionStorage.getItem("token");


    const validateToken = async () => {
        if (!token) {
            navigate("/");
            return;
        }

        try {
            const response = await fetch("http://localhost:5050/record/validate-token", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Invalid token!");
            }

            const data = await response.json();
            console.log("Response Data:", data);

            if (data.role !== "Admin") {
                navigate("/");
                return
            }

            viewFeedback();
        } catch (error) {
            console.error("Invalid token:", error.message);
            sessionStorage.removeItem("token");
            navigate("/");
        }
    };

    const viewFeedback = async () => {
        try {
            const response = await fetch("http://localhost:5050/record/view-feedback/admin-view", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("No feedbacks found");

            const data = await response.json();
            setFeedbacks(data);

            console.log(data);
        } catch (error) {
            window.alert(error.message);
            console.error("Error:", error);
        }
    };

    useEffect(() => {
        validateToken();
    }, [token]);

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




    const deleteFeedback = async (feedbackId) => {
        const confirmation = window.confirm("Are you sure you want to delete this feedback?");
        if (!confirmation) {
            return;
        }

        try {
            const responseData = await fetch(`http://localhost:5050/record/view-feedback/${feedbackId}`, {
                method: "DELETE",
                headers: {
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




    const deleteReply = async (replyId) => {
        const confirmation = window.confirm("Are you sure you want to delete this reply?");
        if (!confirmation) {
            return;
        }

        try {
            const responseData = await fetch(`http://localhost:5050/record/view-replies/${replyId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!responseData.ok) {
                const errorData = await responseData.json();
                window.alert(errorData.message);
                return;
            }
            setReplies((prevReplies) => prevReplies.filter(reply => reply._id !== replyId));

            window.alert("Deleted successfully!");
        } catch (error) {
            window.alert("Failed to delete reply.");
            console.error(error);
        }
    };



    const viewFullFeedback = async (feedbackId) => {
        try {
            const response = await fetch(`http://localhost:5050/record/view-feedback/admin-view-by-id/${feedbackId}`, {
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






    const replyFeedback = async (feedbackId) => {

        
        if (replyContent.length > 1500) {
            alert("Please make sure that your reply is less than 1500 characters.");
            return false;
        }


        if (!replyContent || replyContent.trim() === "") {
            alert("Please enter your reply.");
            return false;
        }

        const confirmation = window.confirm("Are you sure you want to reply to this feedback?");
        if (!confirmation) {
            return;
        }





        setLoading(true);

        try {
            const responseData = await fetch(`http://localhost:5050/record/view-feedback/${feedbackId}/reply`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ reply: replyContent }),
            });

            if (!responseData.ok) {
                const errorData = await responseData.json();
                window.alert(errorData.message);
                return;
            }

            window.alert("Replied successfully, sent an email to the member!");
            setReplyContent("");
            closePopup();
            window.location.reload()
        } catch (error) {
            window.alert("Failed to reply to feedback.");
            console.error(error);
        }finally {
            setLoading(false);
        }
    };



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


    const openViewReplyPopup = () => {
        setViewReplyPopup(true);


    };

    const closeViewReplyPopup = () => {
        setViewReplyPopup(false); 
        setSelectedFeedback(null);
    };



    const openReplyPopup = (feedback) => {
        setSelectedFeedback(feedback);
        setPopup(true);
    };

    const closePopup = () => {
        setPopup(false);
        setSelectedFeedback(null);
        setReplyContent("");
    };


    const openFeedbackPopup = (feedback) => {
        setSelectedFeedback(feedback);
        setfeedbackPopup(true);
    };

    const closeFeedbackPopup = () => {
        setfeedbackPopup(false);
        setSelectedFeedback(null);
        window.location.reload()
    };

    const storedname = sessionStorage.getItem("name");
    const storedemail = sessionStorage.getItem("email");

    const filteredFeedbacks = feedbacks.filter(feedback =>
        feedback.name.toLowerCase().includes(search.toLowerCase()) ||
        feedback.title.toLowerCase().includes(search.toLowerCase()) ||
        feedback.email.toLowerCase().includes(search.toLowerCase()) ||
        feedback.feedback.toLowerCase().includes(search.toLowerCase())

    );

    return (
        <div>


            <div className="feedbackHeaders">
                <h2>All feedbacks</h2>
                <p>Please read, review, and respond to all feedbacks properly. Let&apos;s maintain a respectful and supportive environment for everyone.</p>
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
                                    <button className="reply" onClick={() => openReplyPopup(feedback._id)}>Reply</button>
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
                    <b>No feedbacks found!</b>
                </div>
            )}


            {popup && (
                <div className="popup">
                    <div className="popupContentReplyToFeedback">




                        <h3 className="titleReply">Reply to feedback</h3>
                        <p className="titleReply">Please read carefully and reply. Make sure you are polite and friendly!</p>
                        <hr />


                        <form onSubmit={(e) => { e.preventDefault(); replyFeedback(selectedFeedback); }}>
                            <div className="form-container">
                                <label htmlFor="editFeedbackCategory">Admin Name:</label>
                                <input
                                    disabled
                                    id="editFeedbackCategory"
                                    type="text"
                                    name="category"
                                    value={storedname}
                                />
                                <label htmlFor="editFeedbackCategory">Admin email:</label>
                                <input
                                    disabled
                                    id="editFeedbackCategory"
                                    type="text"
                                    name="category"
                                    value={storedemail}
                                />
                                <label htmlFor="editFeedbackCategory">Reply:</label>
                                <textarea
                                    id="replyInput"
                                    placeholder="Enter your reply here..."
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                />
                            </div>


                            <div className="sendReplyDIV">                         


                                   <button type="submit" className="sendReply" disabled={loading} >
                    {loading ? "Sending reply please wait..." : "Send reply"}
                </button>


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

                            <div className="replyDIV">
                                {replies.length > 0 ? (
                                    replies.map((reply, index) => (
                                        <div key={index} className="replyContent">
                                            <p><b>{reply.adminEmail} | {reply.adminName}</b>: {reply.reply}</p>
                                            <div className="deleteReplyButton">
                                                <button onClick={() => deleteReply(reply._id)}>Delete</button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>No replies found.</p>
                                )}

                            </div>

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