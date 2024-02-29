export const createRequest: Controller = async (req, res) => {
  try {
      const {
          requestorFirstName,
          requestorLastName,
          requestorPhoneNumber,
          requestorEmail,
          relationName,
          patientFirstName,
          patientLastName,
          patientEmail,
          patientPhoneNumber,
          street,
          dob,
          city,
          state,
          zipCode,
      } = req.body;

      let requestType = RequestType.Family;
      let status = ProfileStatus.Active;

      let emailFound = isEmailFound(req, res);

      if (!emailFound) {
          const { password } = req.body;
          const hashedPassword = await bcrypt.hash(
              password,
              Number(ITERATION)
          );

          const newUser = await User.create({
              userName: patientFirstName,
              password: hashedPassword,
              firstName: patientFirstName,
              lastName: patientLastName,
              email: patientEmail,
              phoneNumber: patientPhoneNumber,
              street,
              city,
              state,
              zipCode,
              dob,
              accountType: AccountType.User,
              createdAt: new Date(),
              updatedAt: new Date(),
          });
          if(newUser) {
              return res.json({
                  status: httpCode.OK,
                  message: messageConstant.USER_CREATED,
                  data: newUser,
              });
          } else {
              throw new Error("Failed to create account.");
          }
      } else {
          const newRequest = await Request.create({
              requestType,
              userId: 1,
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
              dob,
              street,
              city,
              state,
              zipCode,
              createdAt: new Date(),
              updatedAt: new Date(),
          });
          return res.status(httpCode.OK).json({
              status: httpCode.OK,
              message: messageConstant.REQUEST_CREATED,
              data: newRequest,
          });
      }
  } catch (error: any) {
      return AppError(error, req, res);
  }
};
