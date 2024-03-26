const express = require('express');
const app = express();
const port = process.env.PORT || 5000   ;

// Define routes
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Set up a server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
