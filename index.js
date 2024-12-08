const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const dbase = require('./config');

const app = express();

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

app.use(express.json());
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: 'Mini_Project', 
    resave: false,
    saveUninitialized: true,
}));

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post("/login_auto_driver", async (req, res) => {

    const data = {
        title: req.body.auto_driver_form_default,
        name: req.body.name,
        phoneNumber:req.body.phone,
        points: [req.body.from,req.body.to],
        timing: req.body.timing,
        autono: req.body.autoNo,
        email: req.body.email,
        password: req.body.password
    }

    const existingUser = await dbase.findOne({phoneNumber: data.phoneNumber});
    if(existingUser) {
// Create a popup for user already exists message
res.send(
    `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>User Exists</title>
        <style>
            body { font-family: Arial, sans-serif; }
            .popup {
                position: fixed;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                padding: 20px;
                background-color: white;
                border: 1px solid #ccc;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
                z-index: 1000;
            }
            .overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 999;
            }
            .close-btn {
                margin-top: 10px;
                padding: 5px 10px;
                background-color: #007BFF;
                color: white;
                border: none;
                cursor: pointer;
            }
        </style>
    </head>
    <body>
        <div class="overlay"></div>
        <div class="popup">
            <h2>User Already Exists</h2>
            <p>Please choose a different phone number.</p>
            <button class="close-btn" onclick="window.location.href='login.html';">Close</button>
        </div>
    </body>
    </html>`);    
    }else {

        const userdata = await dbase.insertMany(data);
        console.log(userdata);

        req.session.user = {
            phoneNumber: data.phoneNumber,
            title: data.title,
            name: data.name,
        }; 

        res.sendFile(__dirname + '/public/auto_driver_main.html');
    }
});

app.post("/login_rider", async (req, res) => {

    const data = {
        title: req.body.rider_form_default,
        name: req.body.name,
        phoneNumber:req.body.phone,
        email: req.body.email,
        password: req.body.password
    }

    const existingUser = await dbase.findOne({phoneNumber: data.phoneNumber});
    if(existingUser) {
        res.send("User already exists. Please choose a different username."); //create a popup
    }else {

        const userdata = await dbase.insertMany(data);
        console.log(userdata);

        req.session.user = {
            phoneNumber: data.phoneNumber,
            title: data.title,
            name: data.name,
        }; 
        res.sendFile(`${__dirname}/public/rider_main.html`);
    }
});

app.post("/login", async (req, res) => {
    try{
        const check = await dbase.findOne({phoneNumber: req.body.phone});
        if(!check) {
            res.send("user name cannot found");
        }

        if(req.body.password === check.password) {

            req.session.user = {
                phoneNumber: check.phoneNumber,
                title: check.title,
                name: check.name,
            }; 

            if(check.title === 'rider') {
                res.sendFile(__dirname + '/public/rider_main.html');
            }else {
                res.sendFile(__dirname + '/public/auto_driver_main.html');
            }
            
        }else {
            req.send("wrong password"); //popup
        }
    }catch{
        res.send("Wrong Details"); //popup
    }
});

app.get('/auto_driver_main', (req, res) => {
    if (req.session.user) {
        
        res.sendFile(path.join(__dirname, 'public', 'auto_driver_main.html'));
    } else {
        res.redirect('/login'); 
    }
});

app.get('/rider_main', (req, res) => {
    if (req.session.user) {
        
        res.sendFile(path.join(__dirname, 'public', 'rider_main.html'));
    } else {
        res.redirect('/login');
    }
});

app.post('/main_auto_driver', async (req, res) => {
    const status = req.body.status;
    const phoneNumber = req.session.user?.phoneNumber;

    try {
        if (!phoneNumber) {
            return res.status(401).json({ message: 'User not authenticated' });
            res.sendFile(__dirname + '/public/login.html');
        }
        const result = await dbase.findOneAndUpdate(
            { phoneNumber: phoneNumber }, // Query to find the user
            { status: status },           // Update operation
            { new: true }  // Returns the updated document
        );

        if (result) {
            console.log({ message: 'Status updated successfully', user: result });
            res.sendFile(__dirname + '/public/auto_driver_main.html');
        } else {
            console.log({ message: 'User not found' });
            res.sendFile(__dirname + '/public/login.html');
        }
    } catch (error) {
        console.error("Error updating status:", error);
        console.log({ message: 'Internal server error' });
        res.sendFile(__dirname + '/public/login.html');
    }
});

app.post('/search-drivers', async (req, res) => {
    const { from, to, status } = req.body;

    try {
        // Prepare query based on selected values
        const query = {
            title: 'auto_driver',
            points: { $all: [from, to] } // Match both 'from' and 'to' in points array
        };

        if (status !== 'all') {
            query.status = status; // Filter by status if not 'all'
        }

        // Find matching drivers
        const drivers = await dbase.find(query);
        
        res.status(200).json(drivers); // Send back the matching drivers
    } catch (error) {
        console.error("Error searching drivers:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return console.log(err);
        }
        res.sendFile(__dirname + '/public/login.html');
    });
});