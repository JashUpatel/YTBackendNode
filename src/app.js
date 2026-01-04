import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

// cors middleware we can configure specific origin instead of *
// which is by default allowed when we use cors() without options object
// we can also set other options like methods, allowed headers etc.
// here we are using FRONTEND_URL from env variables to set the allowed origin
// credentials:true allows cookies and authentication tokens to be sent
// along with cross-origin requests from your frontend to your backend
/* -> Specific use cases:
- Authentication tokens in cookies - When your frontend needs to send 
session cookies or auth tokens to the backend with every request
- HTTP-only cookies - Credentials are essential for HTTP-only cookies
 (more secure) to work across domains
- Maintaining user sessions - Cookies that track logged-in users across different origins
- Authorization headers - Allows the browser to include the Authorization header with requests

-> How it works:
- Without credentials: true - Browsers block cookies from being sent in 
cross-origin requests for security reasons
- With credentials: true - The browser will include 
credentials (cookies, HTTP auth, TLS certs) in cross-origin requests

-> Important note: When using credentials: true, you cannot use origin: "*" (wildcard).
 You must specify the exact frontend URL (which you're doing with process.env.FRONTEND_URL). 
 This is a security requirement to prevent credential leaks to unauthorized origins.
*/
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);
// can be done as app.use(cors()); which allows all origins by default

// Built-in middleware to parse JSON bodies coming from requests
app.use(
  express.json({
    limit: "16kb", // Limit body size to 16kb
  })
);

// Built-in middleware to parse URL-encoded bodies and accept data from url
// extended: true allows to parse nested objects. it is optional to pass
// we can also use limit here like json middleware
// to parse data in url encoded format for eg: jash patel will be jash+patel or jash%20patel in url
// to convert this special character encoding in url back to normal string this middleware is used
// 1. URL Parameters (route params) - NO middleware needed:
// app.get("/users/:id", (req, res) => {
//   console.log(req.params.id); // Works without any middleware
// });
// 2. Query Parameters - NO middleware needed:
// app.get("/users", (req, res) => {
//   console.log(req.query.search); // Works without any middleware
//   console.log(req.query.age);
// });
// 3. URL-encoded form data (in request body) - REQUIRES middleware
// Data: application/x-www-form-urlencoded
// Needs: app.use(express.urlencoded({ extended: true }));
// app.post("/users", (req, res) => {
//   console.log(req.body.name); // Requires urlencoded middleware
// });
app.use(urlencoded({ extended: true, limit: "16kb" }));

// Serving static files from 'public' directory public is folder name we created in root directory
// For example, to serve public assets like images, files, folders we want to store and serve publicly
app.use(express.static("public"));

// Middleware to parse cookies from incoming requests
// to access and set cookies in client browser from the server
// to set secure cookies, httpOnly cookies etc for security purpose.
// secure cookies which only server can set, read and remove and are only sent over https
// there are options we can specify but not very much needed
app.use(cookieParser());

export default app;
