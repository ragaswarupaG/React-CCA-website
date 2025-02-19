// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";


export default function Create() {
    // const token = localStorage.getItem('token');
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
                // localStorage.removeItem("token"); 
                sessionStorage.removeItem("token");
                navigate("/");
            }
        };
        validateToken();
    }, [token, navigate]);


    const [form, setForm] = useState({
        name: "",
        role: "",
        password: "",
        email: "",
        mobile: "",
        matrix: "",
        gender: "",
        course: "",
        year: ""
    });



    // these methods will update the state properties
    function updateForm(value) {
        return setForm((prev) => {
            return { ...prev, ...value };
        });
    }

    function validateForm() {
        const nameRegex = /^[a-zA-Z\s]+$/;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;


        if (!form.name || form.name.trim() === "") {
            alert("Please enter the name.");
            return false;
        }

        if (!nameRegex.test(form.name.trim()) || form.name.length > 50) {
            alert("Name should only contain alphabets, and must be less than 50 characters.");
            return false;
        }

        if (!emailRegex.test(form.email)) {
            alert("Enter a valid email!");
            return false;
        }

        if (!nameRegex.test(form.course)) {
            alert("Enter a valid course name. Ensure it only contains alphabets");
            return false;
        }

        if (form.course.trim() === "") {
            alert("Please enter the course name.");
            return false;
        }

        if (form.mobile.length != 8) {
            alert("Please enter a valid SG mobile number with 8 digits only.")
            return false

        }

        if (!form.matrix || form.matrix.trim() === "") {
            alert("Please enter the matrix number.");
            return false;
        }

        if (form.matrix.includes(" ")) {
            alert("Matrix number should not contain spaces.")
            return false;
        }
        return true;
    }



    // this function will handle the submission
    async function onSubmit(e) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const confirmation = window.confirm("Are you sure you want to add this member?");
        if (!confirmation) {
            return;
        }

        const newPerson = { ...form };

        const response = await fetch("http://localhost:5050/record", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(newPerson),

        })

        if (!response.ok) {

            const errorData = await response.json();
            window.alert(errorData.message)
            return

        }

        alert("Member added successfully!");


        setForm({
            name: "",
            role: "",
            password: "",
            email: "",
            mobile: "",
            matrix: "",
            gender: "",
            course: ""
        });
        navigate("/");
    }

    return (





        <div className="memberContainer" >
            <h3>Add a new user!</h3>



            
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        className="form-control"
                        id="name"
                        value={form.name}
                        required
                        onChange={(e) => updateForm({ name: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="role">Role</label>
                    <select
                        className="form-control"
                        id="role"
                        value={form.role}
                        required
                        onChange={(e) => updateForm({ role: e.target.value })}>
                        <option value="" disabled>Select role</option>
                        <option value="Member">Member</option>
                        <option value="Admin" disabled>Admin</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        id="email"
                        value={form.email}
                        required
                        onChange={(e) => updateForm({ email: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="mobile">Mobile</label>
                    <input
                        type="number"
                        className="form-control"
                        id="mobile"
                        value={form.mobile}
                        required
                        onChange={(e) => updateForm({ mobile: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="matrix">Matrix Number</label>
                    <input
                        type="text"
                        className="form-control"
                        id="matrix"
                        value={form.matrix}
                        required
                        onChange={(e) => updateForm({ matrix: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="gender">Gender</label>
                    <select
                        className="form-control"
                        id="gender"
                        value={form.gender}
                        required
                        onChange={(e) => updateForm({ gender: e.target.value })}>
                        <option value="" disabled>Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="course">Course</label>
                    <input
                        type="text"
                        className="form-control"
                        id="course"
                        value={form.course}
                        required
                        onChange={(e) => updateForm({ course: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="course">Year</label>
                    <select
                        className="form-control"
                        id="year"
                        value={form.year}
                        required
                        onChange={(e) => updateForm({ year: e.target.value })}>
                        <option value="" disabled>Select year of study</option>
                        <option value="1">1</option>
                        <option value="2" >2</option>
                        <option value="3" >3</option>
                        <option value="PFP" >PFP</option>
                    </select>

                </div>

                <div className="form-group">
                    <label htmlFor="password">Assign a temporary password</label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        value={form.password}
                        required
                        onChange={(e) => updateForm({ password: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <input
                        type="submit"
                        value="Create Person"
                        className="userButton"
                    />
                </div>
            </form>
        </div>
    );
}
