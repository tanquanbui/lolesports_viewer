const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Import the cors package

const app = express();
const PORT = 4000; // Adjusted to the port used in your request

// Use CORS middleware to allow requests from localhost:3000
app.use(cors());

// Define the route for fetching the Worlds 2024 roster
app.get('/', async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    const queryUrl = 'https://lol.fandom.com/api.php';
    const params = {
        action: 'cargoquery',
        tables: 'TournamentRosters',
        fields: 'TournamentRosters.Tournament, TournamentRosters.Team, TournamentRosters.RosterLinks, TournamentRosters.Roles',
        where: 'TournamentRosters.Tournament="Worlds 2024 Main Event"',
        limit: 500,
        format: 'json'
    };

    try {
        const response = await axios.get(queryUrl, { params });
        const rosterData = response.data.cargoquery.map(item => ({
            tournament: item.title.Tournament,
            team: item.title.Team,
            rosterLinks: item.title.RosterLinks,
            roles: item.title.Roles
        }));

        res.json(rosterData);
    } catch (error) {
        console.error('Error fetching roster data:', error);
        res.status(500).json({ error: 'Failed to fetch roster data' });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
