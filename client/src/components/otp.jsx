// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import { useNavigate } from "react-router";
import '/styles.css';

export default function OTP() {
    const [otp, setOTP] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const email = sessionStorage.getItem("email");
    console.log(email)


    const handleOtpChange = (e) => {
        setOTP(e.target.value);
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5050/record/verifyOTP", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, otp }),
            });

            const data = await response.json();
            window.alert(data.message)
            console.log(data)

            if (response.ok) {
                const token = data.token;

                if (token) {
                    sessionStorage.setItem('token', token);
                    console.log("Token saved:", token);
                    console.log("User Details:", data.userWithoutPassword);
                   
                    sessionStorage.setItem('name', data.userWithoutPassword.name);


                    navigate("/");
                }


            } else {
                console.log(data.message)
                window.alert(data.message);
            }
        } catch (error) {
            window.alert(error)
            console.error("Error:", error);
        }
    };




    const resendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch("http://localhost:5050/record/resendOTP", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, otp }),
            });

            const data = await response.json();
            window.alert(data.message)
            console.log(data)

        } catch (error) {
            window.alert(error)
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    }

    
    return (
        <div className="containerOTP">
            <form onSubmit={handleSubmit} className="formStyle">
                <h3>Enter OTP</h3>
                <input
                    type="text"
                    placeholder="Enter your OTP"
                    value={otp}
                    required
                    onChange={handleOtpChange}
                    className="inputStyle"
                />
                <button type="submit" className="buttonStyle">Submit</button>


                <button type="submit" className="textbutton" disabled={loading} onClick={resendOTP}>
                    {loading ? "Resending OTP, Please wait..." : "Resend OTP"}
                </button>

            </form>
        </div>
    );
}
