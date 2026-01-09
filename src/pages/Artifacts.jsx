import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import ArtifactDetail from "../components/ArtifactDetail";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthProvider";

const Artifacts = () => {

    const [artifacts, setArtifacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedArtifact, setSelectedArtifact] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const { isAuthenticated } = useAuth();

    const fetchArtifacts = async (shouldUpdateSelected = false) => {
        try {
            const response = await axios.get("http://localhost:8000/api/artifacts", {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setArtifacts(response.data);
            
            if (shouldUpdateSelected && selectedArtifact) {
                const updatedArtifact = response.data.find(a => a.id === selectedArtifact.id);
                if (updatedArtifact) {
                    setSelectedArtifact(updatedArtifact);
                }
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching artifacts:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArtifacts(false);
    }, []);

    
    const handleCloseModal = () => {
        setSelectedArtifact(null);
    };

    const normalizedTerm = searchTerm.trim().toLowerCase();
    const filteredArtifacts = artifacts.filter((artifact) => {
        if (!normalizedTerm) return true;
        const haystack = `${artifact.title || ""} ${artifact.summary || ""} ${artifact.content || ""}`.toLowerCase();
        return haystack.includes(normalizedTerm);
    });

    return (

        <div className="p-8 flex flex-1 flex-col items-center">

            {isAuthenticated() && (<div className="flex gap-2 mb-4">
                <Link to="/personal-artifacts" className="mb-4 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 cursor-pointer">
                    My Artifacts
                </Link>
                <Link to="/create-artifact" className="mb-4 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 cursor-pointer">
                    Create New Artifact
                </Link>
            </div>)}

            <form
                className="mb-2 w-full max-w-xl flex justify-center gap-4"
                onSubmit={(event) => event.preventDefault()}
            >
                <input
                    className="p-2 border border-gray-300 rounded"
                    name="q"
                    type="search"
                    placeholder="Search artifacts..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                />
                <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 cursor-pointer">
                    Search
                </button>
            </form>
            <p className="mb-6 max-w-lg text-center text-sm text-amber-700">There might be some delay in fetching the artifacts from the South America region as the network is not stable in those areas.</p>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="w-full max-w-4xl flex flex-col items-center gap-4">
                    {filteredArtifacts.length > 0 ? filteredArtifacts.map((artifact) => (
                            <div 
                                key={artifact.id} 
                                className="w-full max-w-xl border border-gray-300 rounded p-5 shadow hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                                onClick={() => setSelectedArtifact(artifact)}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                                        {artifact.title}
                                    </h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border border-gray-300 bg-teal-100 text-teal-800`}>
                                        {artifact.status}
                                    </span>
                                </div>
                                
                                <p className="text-gray-700 dark:text-gray-300 mb-3">{artifact.summary}</p>
                                
                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3">
                                    <div className="flex items-center gap-1">
                                        <span>Created: {new Date(artifact.created_on).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span>Updated: {new Date(artifact.last_updated).toLocaleDateString()}</span>
                                    </div>
                                    {artifact.file && (
                                        <div className="flex items-center gap-1">
                                            <span className="truncate max-w-xs">Files: {artifact.file}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                    )) : <p className="text-center col-span-full">No artifacts found.</p>}
                </div>
            )}

            {selectedArtifact && (
                <Modal isOpen={true} onClose={handleCloseModal}>
                    <ArtifactDetail 
                        key={selectedArtifact.id}
                        id={selectedArtifact.id}
                        title={selectedArtifact.title}
                        content={selectedArtifact.content}
                        summary={selectedArtifact.summary}
                        fileUrl={selectedArtifact.file_url}
                        status={selectedArtifact.status}
                        createdBy={selectedArtifact.created_by}
                        review={selectedArtifact.review}
                        reviewRequested={selectedArtifact.review_requested}
                        ratings={selectedArtifact.ratings}
                        onRatingUpdate={() => fetchArtifacts(true)}
                    />
                </Modal>
            )}
        </div>

    );
};

export default Artifacts;