// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";

export default function Edit() {
    const token = sessionStorage.getItem('token');
    const params = useParams();
    const navigate = useNavigate();


    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                navigate("/");
                window.location.reload()
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
        role: "",
        password: "",
        email: "",
        mobile: "",
        matrix: "",
        gender: "",
        course: "",
        records: [],
    });

    function updateForm(value) {
        return setForm((prev) => {
            return { ...prev, ...value };
        });
    }

    function validateForm() {
        const nameRegex = /^[a-zA-Z\s]+$/;
        const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

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
            alert("Enter a valid course name!");
            return false;
        }

        if (form.course.trim() === "") {
            alert("Enter the course name.");
            return false;
        }
        if (form.mobile.length != 8) {
            alert("Please enter a valid SG mobile number with 8 digits only.")
            return false

        }

        if (!form.matrix || form.matrix.trim() === "") {
            alert("Enter the matrix number.");
            return false;
        }
        if (form.matrix.includes(" ")) {
            alert("Matrix number should not contain spaces.")
            return false;
        }
        return true;
    }

    async function fetchData() {
        const id = params.id.toString();
        const response = await fetch(`http://localhost:5050/record/${params.id.toString()}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const message = `An error has occurred: ${response.statusText}`;
            console.log(message)
            return;
        }

        const record = await response.json();

        if (!record) {
            window.alert(`Member with id ${id} not found`);
            navigate("/");
            return;
        }
        setForm(record);
    }

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id]);

    async function onSubmit(e) {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        const confirmation = window.confirm("Are you sure you want to save the changes made to this member?");
        if (!confirmation) {
            return;
        }

        const editedPerson = {
            name: form.name,
            role: form.role,
            password: form.password,
            email: form.email,
            mobile: form.mobile,
            matrix: form.matrix,
            gender: form.gender,
            course: form.course,
            year: form.year
        };

        const responseData = await fetch(`http://localhost:5050/record/${params.id}`, {
            method: "PATCH",
            body: JSON.stringify(editedPerson),
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
        navigate("/");
    }

    return (
        <div className="memberContainer">
            <h3>Update Member</h3>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        className="form-control"
                        id="name"
                        value={form.name}
                        onChange={(e) => updateForm({ name: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="role">Role</label>
                    <select
                        className="form-control"
                        id="role"
                        value={form.role}
                        onChange={(e) => updateForm({ role: e.target.value })}>
                        <option value="" disabled> Select role </option>
                        <option value="Member">Member</option>
                        <option value="Admin" disabled>Admin</option>
                    </select>
                </div>
                <div>
                    <div className="form-group">
                        <label htmlFor="position">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            value={form.email}
                            onChange={(e) => updateForm({ email: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="position">Mobile</label>
                        <input
                            type="number"
                            className="form-control"
                            id="mobile"
                            value={form.mobile}
                            onChange={(e) => updateForm({ mobile: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="position">Matrix Number</label>
                        <input
                            type="text"
                            className="form-control"
                            id="matrix"
                            value={form.matrix}
                            onChange={(e) => updateForm({ matrix: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="gender">Gender</label>
                        <select
                            className="form-control"
                            id="gender"
                            value={form.gender}
                            onChange={(e) => updateForm({ gender: e.target.value })}>
                            <option value="" disabled> Select Gender </option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="position">Course</label>
                        <input
                            type="text"
                            className="form-control"
                            id="course"
                            value={form.course}
                            onChange={(e) => updateForm({ course: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="position">Year</label>




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






                    <br />

                    <div className="form-group">
                        <input
                            type="submit"
                            value="Update Record"
                            className="userButton"
                        />
                    </div>
                </div>
            </form>
        </div>
    );
}
