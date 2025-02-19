/* eslint-disable react/prop-types */
// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import '@fortawesome/fontawesome-free/css/all.min.css';


const Record = (props) => {


    return (
        <tr>
            <td>{props.record.name}</td>
            <td>{props.record.role}</td>
            <td>{props.record.email}</td>
            <td>{props.record.mobile}</td>

        </tr>
    );
};


export default function CoachAdminsList() {
    const [records, setRecords] = useState([]);

    useEffect(() => {
        async function getRecords() {
            const response = await fetch(`http://localhost:5050/record/public`);

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
    }, [records.length]

    );



    function recordList() {
        return records
            .filter(record => record.role !== "Member")
            .map((record) => {
                return (
                    <Record
                        record={record}
                        key={record._id}
                    />
                );
            });
    }

    return (

        <div className="container" style={{ paddingLeft: "10px", margin: "20px" }}>
            <h3 style={{ paddingTop: "10px", margin: "0px", fontSize: "35px" }}>Coaches & Admins List</h3>


            <form className="custom-search-form">
                <div className="custom-search-wrapper">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input
                        className="custom-search-input"
                        type="search"
                        placeholder="Search for names here!"
                    />
                </div>
            </form>








            <table className="table table-stripped" style={{ marginTop: 20 }}>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Email</th>
                        <th>Mobile</th>
                    </tr>
                </thead>

                <tbody>
                    {recordList()}
                </tbody>
            </table>
        </div>
    );
}

