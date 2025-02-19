/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { NavLink } from "react-router-dom";


export default function Create() {
    const token = sessionStorage.getItem('token');
    const navigate = useNavigate();
        const [userRole, setUserRole] = useState(null);
    


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


    const [form, setForm] = useState({


        title: "",
        category: "",
        feedback: "",
        improvement: "",
        rating: "",
        image: "",

    });

    function updateForm(value) {
        return setForm((prev) => {
            return { ...prev, ...value };
        });
    }



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
            alert("Please enter the area for improvement section.");
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

        const confirmation = window.confirm("Are you sure you want to send this feedback?");
        if (!confirmation) {
            return;
        }

        console.log(form.title)

        const formData = new FormData();
        formData.append("title", form.title);
        formData.append("category", form.category);
        formData.append("feedback", form.feedback);
        formData.append("improvement", form.improvement);
        formData.append("rating", form.rating);
        if (form.image) {
            formData.append("image", form.image);
        }



        const response = await fetch("http://localhost:5050/record/create-feedback", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            window.alert(errorData.message);
            return;
        }

        alert("Feedback sent successfully!");
        setForm({
            title: "",
            category: "",
            feedback: "",
            improvement: "",
            rating: "",
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


        <>   
      
        <div className="memberContainer" >



            <h3 >Give us your feedback today!</h3>
            <form onSubmit={onSubmit}>


                <div className="form-group-feedback">
                    <label htmlFor="title">Feedback Title</label>
                    <input
                        type="text"
                        className="form-control"
                        id="title"
                        value={form.title}
                        placeholder="Give a title to your feedback"
                        required
                        onChange={(e) => updateForm({ title: e.target.value })}
                    />
                </div>



                <div className="form-group-feedback">
                    <label htmlFor="category">Feedback Category</label>
                    <select
                        className="form-control"
                        id="category"
                        value={form.category}
                        required
                        onChange={(e) => updateForm({ category: e.target.value })}>
                        <option value="" disabled>Select feedback category</option>
                        <option value="GeneralFeedback">General Feedback</option>
                        <option value="Query" >Query</option>
                        <option value="Complaint" >Complaint</option>
                        <option value="Others" >Others</option>
                    </select>

                </div>


                <div className="form-group-feedback">
                    <label htmlFor="feedback">Feedback</label>
                    <textarea
                        type="textarea"
                        className="form-control"
                        id="feedback"
                        value={form.feedback}
                        placeholder="Enter the content of your feedback..."
                        required
                        onChange={(e) => updateForm({ feedback: e.target.value })}
                    />
                </div>

                <div className="form-group-feedback">
                    <label htmlFor="improvement">Area for improvement</label>
                    <textarea
                        type="text"
                        className="form-control"
                        id="improvement"
                        value={form.improvement}
                        placeholder="Let us know if we can improve anything..."

                        required
                        onChange={(e) => updateForm({ improvement: e.target.value })}
                    />
                </div>


                <div className="form-group-feedback">
                    <label htmlFor="image">Upload an image (Optional)</label>
                    <input
                        type="file"
                        className="image-picker"
                        id="image"
                        onChange={handleImageChange}
                    />


                    {form.image && (
                        <>
                            <img src={form.image}  />
                            <div>
                                <button
                                    type="button"
                                    onClick={removePic}
                                >
                                    Remove
                                </button>
                            </div>
                        </>
                    )}
                </div>


                <div className="form-group-feedback">
                    <label htmlFor="rating">CCA Rating (5 being the best)</label>
                    <div className="rating">
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
                </div>





                <div className="form-group-feedback">


                    <div className="submitFeedbackAlignement">
                        <input
                            type="submit"
                            value="Submit feedback"
                            className="feedbackButton"
                        />
                    </div>

                </div>
            </form>
        </div>
        </>
    );
}