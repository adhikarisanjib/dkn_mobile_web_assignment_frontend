import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import axios from "axios";

import { useAuth } from "../context/AuthProvider";


const CreateCommunity = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const navigate = useNavigate();
    const { getAccessToken } = useAuth();

    const handleCreateCommunity = async (e) => {
        e.preventDefault();

        try {
            const token = await getAccessToken();
            await axios.post("http://localhost:8000/api/create-community", { name, description }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });
            toast.success("Community created successfully!");
            navigate("/");

        } catch (error) {
            toast.error("Failed to create community. Please try again.");
        }
    };

    return (
        <div className="p-8 flex flex-1 flex-col items-center">

            <form className="w-full max-w-xl flex flex-col gap-2" method="post">

                <legend className="py-2 text-2xl font-bold border-b border-gray-300">Create Community</legend>

                <div className="flex flex-col gap-1">
                    <label htmlFor="id-name">Name</label>
                    <input type="text" id="id-name" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="flex flex-col gap-1">
                    <label htmlFor="id-description">Description</label>
                    <textarea id="id-description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
                </div>

                <button onClick={handleCreateCommunity} className="mt-4 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 cursor-pointer">
                    Create Community
                </button>

            </form>

        </div>
    );
};

export default CreateCommunity;