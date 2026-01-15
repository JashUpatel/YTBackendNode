<!-- .gitkeep file to track the empty folders if required else git only track files not folders -->
<!-- create common file and folder structures like controllers for logic, db for db connection, middlewares, models, routes, utils, app.js for creeating and managing app object and separate from indexjs entry file, constants.js -->
<!-- install prettier for formatting working in team repo and follow uniformity among all -->
<!-- add config files for prettiers manually like tabwidth, singlequotes, bracketspacing, semi, trailingcomma -->
<!-- add pretiierignore file to avoid unwanted formating -->
<!-- create mongodb project->cluster for db connection -->
<!-- user: pateljash77_db_user : pateljash77@123 #do not use special character in mongodb password it required special escape strings to hanle in connection string-->
<!-- update port, mongodb connection string in env file -->
<!-- create DB name constant in constant.js /can create in env file as well but dbname is not that sensitive-->
<!-- install mongoose, express, dotenv package -->
<!-- create db/index.js file for connectDB function for mongoDB connection -->
<!-- import connectDB function in entry index file and call it-->
<!-- install cookie-parser for managing cookies from server, cors for cross-origin req -->
<!-- configure cors middleware, req body parser middleware i.e express.json(), middleware for parsing url encoding, and for serving static public assets, and cookie parser middleware -->
<!-- create wrapper for handling async function to remove boiler plate code for handling async function by wrapping in try/catch block, api error to customise error response to client, api response to standardize the api response while sending-->
<!-- create user and video models and create schema structure-->
<!-- install mongoose-aggregate-paginate-v2 package and add it as a plugin to video schema for aggregation queries in mongoose -->
<!-- install bcrypt and jwt for password hashing and token generation -->
<!-- create mongoose pre hook/middleware for executing middleware pre saveing of document and hash the password before saving if value of passowrd is modified  -->
<!-- create mongoose methods to check the password, generate access and refresh token -->
<!-- adding upload functionality by using cloudinary to store asset on cloud and multer to handle file -->
<!-- install cloudinary and multer -->
<!-- create account on cloudinary and get cloud name, api key, api secret store in .env and configure cloudinary in utils -->
<!-- create a multer middleware to handle files -->