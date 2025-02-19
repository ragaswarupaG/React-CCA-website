/* eslint-disable react/prop-types */
// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router";
import '/styles.css';
import { NavLink } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { NavItem } from "react-bootstrap";
// import ChatBot from "react-chatbotify";
import Chatbot from "./chatbot";







const Record = (props) => {
    const { userRole } = props;
    const token = sessionStorage.getItem('token');


    return (

        <tr>
            <td>{props.record.name}</td>
            <td>{props.record.course}</td>
            <td>{props.record.year}</td>
            <td>{props.record.role}</td>
            <td>{props.record.email}</td>
            <td>{props.record.matrix}</td>
            <td>{props.record.gender}</td>
            <td>
                {token && userRole === "Admin" && (
                    <>
                        <Link className="btn btn-link" to={`/edit/${props.record._id}`}>Edit</Link>
                        <button className="btn btn-link"
                            onClick={() => {
                                const confirmation = window.confirm("Are you sure you want to delete this member?");
                                if (!confirmation) {
                                    return;
                                }
                                props.deleteRecord(props.record._id);
                            }}>Delete
                        </button>
                    </>
                )}
            </td>
        </tr>
    );
};



export default function RecordList() {
    const [userRole, setUserRole] = useState(null);
    const token = sessionStorage.getItem('token');
    const [records, setRecords] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("");

    const navigate = useNavigate();

    useEffect(() => {

        const validateToken = async () => {
            const token = sessionStorage.getItem('token');
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

                console.log("User Role:", data.role);

                
                setUserRole(data.role);
                sessionStorage.setItem('role', data.role);

            } catch (error) {
                console.error("Invalid token:", error.message);
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("role");
                navigate("/");
            }
        };
        validateToken();
    }, [navigate]);



    useEffect(() => {
        async function getRecords() {

            // check the role also, if role != admin then show them the public route
            let url = token && userRole === "Admin" ? "http://localhost:5050/record/" : "http://localhost:5050/record/public";

            const response = await fetch(url, {
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });


            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                window.alert(message);
                return;
            }

            const records = await response.json();
            setRecords(records);
        }
        getRecords();

        return;
    },

    );


    async function deleteRecord(id) {


        if (token && userRole === "Admin") {
            await fetch(`http://localhost:5050/record/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            const newRecords = records.filter((el) => el._id !== id);
            setRecords(newRecords);
        } else {
            navigate("/");
        }
    }


    function recordList() {

        return records
            .filter(record => !["Admin", "Coach"].includes(record.role) &&
                record.name.toLowerCase().includes(search) &&
                (filter === "" || (filter === "PFP" ? record.role === "PFP" : record.year.toString() === filter))
            )

            .map((record) => {
                return (
                    <Record
                        record={record}
                        deleteRecord={() => deleteRecord(record._id)}
                        userRole={userRole}
                        key={record._id}
                    />
                );
            });
    }

    
      

    return (

        <div className="container" style={{ paddingLeft: "10px", margin: "20px" }}>

            <div className="title">
                <h3 style={{ paddingTop: "10px", margin: "0px", fontSize: "35px" }}>Member List</h3>
            </div>



            {token && userRole === "Admin" ? (
                <NavLink className="create-link" to="/create" >
                    Add a new member!
                </NavLink>
            ) : (
                <></>
            )}




            <form className="search-bar" onSubmit={(e) => e.preventDefault()}>
                <div className="custom-search-wrapper">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input
                        className="custom-search-input"
                        type="search"
                        placeholder="Search for names here!"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}


                    />
                </div>
            </form>



            <div className="sorting-methods">
                <button className="sorting-button" onClick={() => setFilter("")}>
                    All
                </button>
                <button className="sorting-button" onClick={() => setFilter("1")}>
                    Year 1 members
                </button>
                <button className="sorting-button" onClick={() => setFilter("2")}>
                    Year 2 members
                </button>
                <button className="sorting-button" onClick={() => setFilter("3")}>
                    Year 3 members
                </button>
                <button className="sorting-button" onClick={() => setFilter("PFP")}>
                    PFP members
                </button>
            </div>



            <table className="table table-stripped" style={{ marginTop: 20 }}>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Course</th>
                        <th>Year</th>
                        <th>Role</th>
                        <th>Email</th>
                        <th>Matrix number</th>
                        <th>Gender</th>
                        {token && userRole === "Admin" ? (
                            <th>Action</th>
                        ) :
                            <></>

                        }
                    </tr>
                </thead>

                <tbody >
                    {recordList()}
                </tbody>
            </table>

          <Chatbot/>
        </div>
    );
}
