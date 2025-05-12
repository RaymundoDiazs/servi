import React from "react";
import { useEffect } from "react";

export default function FormOSF() {

    const [formData, setFormData] = useState({
        nombre: "",
        email: "",
        comentario: ""
      });
    
      const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
      };
    
      const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Datos enviados:", formData);
      };
    
    return <>
    <div className="master">

    </div>
    </>
}

