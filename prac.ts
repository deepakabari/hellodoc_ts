// validation middleware
const validateRequest = (req, res, next) => {
    // check the given data is valid
    const { error } = requestSchema.validate(req.body);
    if (error) {
      return res.status(httpCode.UNPROCESSABLE_CONTENT).json({
        status: httpCode.UNPROCESSABLE_CONTENT,
        message: error,
      });
    }
    // pass the validation, call the next middleware
    next();
  };
  
  // controller function
  export const createRequest: Controller = async (req, res) => {
    try {
      // get the common attributes from the req.body
      const {
        requestType, // value comes from the frontend
        requestStatus,
        requestorFirstName,
        requestorLastName,
        requestorPhoneNumber,
        requestorEmail,
        relationName,
        patientFirstName,
        patientLastName,
        patientEmail,
        patientPhoneNumber,
        status,
        street,
        dob,
        city,
        state,
        zipCode,
        roomNumber,
      } = req.body;
  
      // get the password from the req.body
      const { password } = req.body;
  
      // hash the password
      const hashedPassword = await bcrypt.hash(password, Number(ITERATION));
  
      // find or create a user with the given email
      const [user, created] = await User.findOrCreate({
        where: { email: patientEmail },
        defaults: {
          // use the spread operator to assign the common attributes
          ...req.body,
          userName: patientFirstName,
          password: hashedPassword,
          accountType: AccountType.User,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
  
      // get the user id from the user object
      const userId = user.id;
  
      // if user is created, send a success message
      if (created) {
        res.json({
          status: httpCode.OK,
          message: messageConstant.USER_CREATED,
          data: user,
        });
      }
  
      // create a new patient request with the user id and the common attributes
      const newRequest = await Request.create({
        // use the spread operator to assign the common attributes
        ...req.body,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
  
      // if request successfully created then give success message
      return res.status(httpCode.OK).json({
        status: httpCode.OK,
        message: messageConstant.REQUEST_CREATED,
        data: newRequest,
      });
    } catch (error: any) {
      return AppError(error, req, res);
    }
  };
  
  // in your server.js, use the validation middleware before the controller function
  app.post("/api/exercise/new-user", validateRequest, UserController.addUser);
  