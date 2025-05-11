import { useContext } from "react";
import { SessionContext } from "../Contexts/SessionContext";
import React from 'react';

const NewProject = () => {
    const {sessionType} = useContext(SessionContext)
    if (sessionType !== "osf") {
        return (
            <div>
                Acceso denegado a esta página - {sessionType}
            </div>
        )
    }
    
    return (
        <div>
            <h1>Creación de proyectos 🔥</h1>
            <form>
                <div>
                    <label htmlFor="projectName">Project Name:</label>
                    <input type="text" id="projectName" name="projectName" />
                </div>
                <div>
                    <label htmlFor="description">Description:</label>
                    <textarea id="description" name="description"></textarea>
                </div>
                <button type="submit">Create Project</button>
            </form>
        </div>
    );
};

export default NewProject;