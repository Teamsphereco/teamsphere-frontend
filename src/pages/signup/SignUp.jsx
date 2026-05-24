import { useState } from "react";
import SignUp from "../../components/SignUp";
import Profile from "../../components/Profile";
import useSignup from "../../hooks/useSignup";

export default function Signup() {
    const [state, setState] = useState(true);

    const toggleButton = () => {
        setState(!state);
    };

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        username: "",
        nickname: "",
        file: undefined,
    });

    const handleInputChange = (e, type) => {
        const { name, value, files } = e.target;
        const selectedFile = type === "file" ? files?.[0] : undefined;
    
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === "file" ? selectedFile : value,
        }));
    };

    const handleProfileImageChange = (file) => {
        setFormData((prevData) => ({
            ...prevData,
            file: file || undefined,
        }));
    };

    const { loading, signup } = useSignup();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await signup(formData);
    };
    return (
        <div className="min-h-screen bg-[#fafafa] text-[#171717]">
            {state ?
                <SignUp
                    onChange={handleInputChange}
                    formData={formData}
                    onStateChange={toggleButton}

                />
            :
                <Profile
                    onSubmit={handleSubmit}
                    onChange={handleInputChange}
                    onProfileImageChange={handleProfileImageChange}
                    formData={formData}
                    onStateChange={toggleButton}
                    onLoading={loading}
                />
            }

        </div>
    );
}
