import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../context/AuthProvider";
import { useUser } from "../context/UserProvider";
import { SystemRole, API_BASE_URL as apiBaseUrl } from "../types";


const Communities = () => {

    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const { isAuthenticated, getAccessToken } = useAuth();
    const { user } = useUser();

    useEffect(() => {
        const fetchCommunities = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/api/communities`, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                setCommunities(response.data);
                console.log("Fetched Communities:", response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching communities:", error);
                setLoading(false);
            }
        };

        fetchCommunities();
    }, []);

    const normalizedTerm = searchTerm.trim().toLowerCase();
    const filteredCommunities = communities.filter((community) => {
        if (!normalizedTerm) return true;
        const haystack = `${community.name || ""} ${community.description || ""}`.toLowerCase();
        return haystack.includes(normalizedTerm);
    });

    const handleFollowToggle = async (communityId, isFollowing) => {
        try {
            const token = await getAccessToken();
            if (isFollowing) {
                await axios.post(`${apiBaseUrl}/api/communities/${communityId}/unfollow`, {}, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });
            } else {
                await axios.post(`${apiBaseUrl}/api/communities/${communityId}/follow`, {}, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });
            }
            // Refresh community list to reflect changes
            const response = await axios.get(`${apiBaseUrl}/api/communities`, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            setCommunities(response.data);
        } catch (error) {
            console.error("Error toggling follow status:", error);
        }
    };

    return (

        <div className="p-8 flex flex-1 flex-col items-center">

            {isAuthenticated() && user && user.role === SystemRole.ADMIN && (<Link to="/create-community" className="mb-4 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 cursor-pointer">
                Create New Community
            </Link>)}

            <form
                className="mb-2 w-full max-w-xl flex justify-center gap-4"
                onSubmit={(event) => event.preventDefault()}
            >
                <input
                    className="p-2 border border-gray-300 rounded"
                    name="q"
                    type="search"
                    placeholder="Search communities..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                />
                <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 cursor-pointer">
                    Search
                </button>
            </form>
            
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="w-full max-w-4xl mt-4 flex flex-col items-center gap-4">
                    {filteredCommunities.length > 0 ? filteredCommunities.map((community) => (
                        <>
                            <div 
                                key={community.id} 
                                className="w-full max-w-xl border border-gray-300 rounded p-5 shadow hover:shadow-lg transition-shadow duration-200"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                                        {community.name}
                                    </h3>
                                    {isAuthenticated() && (<span className={`px-3 py-1 rounded-full text-xs font-semibold border border-gray-300 bg-teal-100 text-teal-800 cursor-pointer`}>
                                        {
                                            community.followers.some(follower => follower.user_id === user?.id) ? 
                                            <span onClick={() => handleFollowToggle(community.id, true)}>Unfollow</span> : 
                                            <span onClick={() => handleFollowToggle(community.id, false)}>Follow</span>
                                        }
                                    </span>)}
                                </div>
                                
                                <p className="text-gray-700 dark:text-gray-300 mb-3">{community.description}</p>
                                
                            </div>
                        </>
                    )) : <p className="text-center col-span-full">No communities found.</p>}
                </div>
            )}

        </div>

    );
};

export default Communities;
