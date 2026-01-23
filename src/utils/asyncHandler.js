const asyncHandler = (requestHandler) => {
  // return a function that takes req, res, next and handles errors
  // higher order function that wraps the original request handler
  // without return function would not work as middleware and will throw error
  // without return it will execute requestHandler here itself and not when route is called
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };

// asyncHandler can be written using promises and using try catch block

// const asyncHandler = (fn) => {}
// const asyncHandler = (fn) =>()=> {}
// const asyncHandler = (fn) => async () => {};

// const asyncHandler = (fn) => async (req, res, next) => {
//   try {
//     await fn(req, res, next);
//   } catch (error) {
//     res.status(error.code || 500).json({
//       success: false,
//       message: error.message || "Internal Server Error",
//     });
//   }
// };

// same as above but with comments

// const asyncHandler = (fn) => {  // fn = getUserData function
//   return async (req, res, next) => {  // This function is returned
//     try {
//       await fn(req, res, next);  // Executes the original handler
//     } catch (error) {
//       res.status(error.code || 500).json({...});
//     }
//   };
// };
