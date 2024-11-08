import React, { useEffect, useState } from 'react';
import axios from 'axios';

const WorldsRoster = () => {
    const [rosterData, setRosterData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRosterData = async () => {
            try {
                const queryUrl = 'http://localhost:4000/';
                const response = await axios.get(queryUrl);
                setRosterData(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching roster data:', err);
                setError('Failed to fetch roster data');
                setLoading(false);
            }
        };

        fetchRosterData();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h1>Worlds 2024 Roster</h1>
            <ul>
                {rosterData.map((team, index) => (
                    <li key={index}>
                        <strong>Team:</strong> {team.team} <br />
                        <strong>Tournament:</strong> {team.tournament} <br />
                        <strong>Roster:</strong>
                        <ul>
                            {team.rosterLinks.split(';;').map((player, i) => (
                                <li key={i}>
                                    <strong>Player:</strong> {player} - <strong>Role:</strong> {team.roles.split(';;')[i]}
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default WorldsRoster;
