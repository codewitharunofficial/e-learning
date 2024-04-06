import express from 'express';
import dotenv from 'dotenv';
import cors  from 'cors';
import http from 'http';
import conncetToDB from './DB/db.js';
import UserRoutes from './Routes/UserRoutes.js';
import CoursesRoutes from './Routes/CoursesRoutes.js';
import EnrollmentRoutes from './Routes/EnrollmentRoutes.js';


const app = express();
dotenv.config();
conncetToDB();
const Port = process.env.PORT || 6969;
const server = http.createServer(app);

app.use(cors({
    origin: "*",
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true,
    maxAge: 3600,
}));

app.use(express.json());

app.use("/api/v1/user", UserRoutes);
app.use("/api/v1/courses", CoursesRoutes);
app.use("/api/v1/enrollments", EnrollmentRoutes);

server.listen(Port, (req, res) => {
    console.log(`Server is listening at http://localhost:${Port}`)
});