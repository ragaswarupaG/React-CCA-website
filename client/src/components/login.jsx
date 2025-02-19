// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import { useNavigate } from "react-router";
import '/styles.css';

export default function Login() {
    const [loading, setLoading] = useState(false);
    
    const [form, setForm] = useState({

        password: "",
        role: "",
        email: "",

    });

    const navigate = useNavigate();

    function updateForm(value) {
        return setForm((prev) => {
            return { ...prev, ...value };
        });
    }

    async function onSubmit(e) {
        e.preventDefault();
        setLoading(true); 

        const newLogin = { ...form };
        const response = await fetch("http://localhost:5050/record/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newLogin),
        })

            .catch(error => {
                window.alert(error);
                return;
            });


        if (!response.ok) {
            const errorData = await response.json();
            window.alert(errorData.message)
            window.location.reload()

            return
        }

        const data = await response.json();
        console.log(data)
        if(data.status == "PENDING"){
            console.log('pending')
        }

        sessionStorage.setItem('email', form.email);

        
        const token = data.token;
        
        if (token) {
            sessionStorage.setItem('token', token);
            console.log("Token saved:", token);
            console.log("User Details:", data.userWithoutPassword);
            console.log(data.userWithoutPassword.name)
        }

      


       
        setForm({
            password: "",
            role: "",
            email: "",
        });
        navigate("/verifyOTP");
    }

   
    return (
        <div   className="containerStyle">
            <form  onSubmit={onSubmit} className="formStyle">
                <h3>Login</h3>
                <input
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    required
                    onChange={(e) => updateForm({ email: e.target.value })}
                    className="inputStyle"           
                   
                />
                <select
                    placeholder="Role"
                    value={form.role}
                    required
                    onChange={(e) => updateForm({ role: e.target.value })}
                    className="inputStyle"                >
                    <option value="" disabled>Select Role</option>
                    <option value="Member">Member</option>
                    <option value="Admin">Admin</option>
                </select>

                <input
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    required
                    onChange={(e) => updateForm({ password: e.target.value })}
                    className="inputStyle"                />



                {/* <button type="submit" className="buttonStyle"   >Login</button> */}

 <button type="submit" className="buttonStyle" disabled={loading} >
                    {loading ? "Loading, Please wait..." : "Submit"}
                </button>




            </form>
        </div>
    );
}