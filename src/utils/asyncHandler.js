const asyncHandler = (requestHandler) => {
  (req, res, next) => {
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
