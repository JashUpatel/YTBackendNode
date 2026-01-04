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
<!-- create wrapper for handling async function, api error, api response -->