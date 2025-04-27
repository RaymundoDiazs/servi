import { inputClasses } from "@mui/material";
import React, { useEffect } from "react";
import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";

export default function Logout(){

    const navigate = useNavigate();
    
    useEffect(() => {
        fetch('http://localhost:5000/logout',{
            method: "GET",
            credentials: "include"
        })
        .then((res) => {
            console.log(res)
            if (res.status == 200) {
                navigate("/login")
            }
        })
    })

    return(
        <div className="logout">
            <h1>Cerrando sesión...</h1>
            {/* {Navigate("/login")} */}
        </div>
    )
    
}