const express = require('express');
const dotenv = require('dotenv');
const connectToMongoDB = require('./config/db');
const errorHandler = require('./middlewares/errorMiddleware');
const userRouter = require('./routes/userRoute');
const bookingRouter = require('./routes/bookingRoute');
const cors = require('cors');
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors())

// Database connection
connectToMongoDB();

app.use('/api/users', userRouter);
app.use('/api/booking', bookingRouter);


app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.get('/', (_req, res) => {
    res.send(`Server is running on port ${PORT}`);
});

// listening to the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})

