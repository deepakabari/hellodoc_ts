// import the Sequelize operators
const { Op } = require("sequelize");

export const getNewPatient: Controller = async (req, res) => {
    try {
        // get the state parameter from the route
        const state = req.params.state;

        // define an object to store the attributes and the where clause for each state
        const stateOptions = {
            new: {
                attributes: [
                    [
                        sequelize.fn(
                            "CONCAT",
                            sequelize.col("patientFirstName"),
                            " ",
                            sequelize.col("patientLastName")
                        ),
                        "Name",
                    ],
                    ["dob", "Date Of Birth"],
                    [
                        sequelize.fn(
                            "CONCAT",
                            sequelize.col("requestType"),
                            " ",
                            sequelize.col("requestorFirstName"),
                            " ",
                            sequelize.col("requestorLastName")
                        ),
                        "Requestor",
                    ],
                    ["createdAt", "Requested Date"],
                    ["patientPhoneNumber", "Phone"],
                    [
                        sequelize.fn(
                            "CONCAT",
                            sequelize.col("street"),
                            ", ",
                            sequelize.col("city"),
                            ", ",
                            sequelize.col("state"),
                            ", ",
                            sequelize.col("zipCode")
                        ),
                        "Address",
                    ],
                    ["patientNote", "Notes"],
                ],
                where: {
                    caseTag: "New",
                    deletedAt: null,
                },
            },
            pending: {
                attributes: [
                    [
                        sequelize.fn(
                            "CONCAT",
                            sequelize.col("patientFirstName"),
                            " ",
                            sequelize.col("patientLastName")
                        ),
                        "Name",
                    ],
                    ["dob", "Date Of Birth"],
                    [
                        sequelize.fn(
                            "CONCAT",
                            sequelize.col("requestType"),
                            " ",
                            sequelize.col("requestorFirstName"),
                            " ",
                            sequelize.col("requestorLastName")
                        ),
                        "Requestor",
                    ],
                    [
                        sequelize.fn(
                            "CONCAT",
                            sequelize.col("User.firstName"),
                            " ",
                            sequelize.col("User.lastName")
                        ),
                        "Physician Name",
                    ],
                    ["updatedAt", "Date Of Service"],
                    ["patientPhoneNumber", "Phone"],
                    [
                        sequelize.fn(
                            "CONCAT",
                            sequelize.col("street"),
                            ", ",
                            sequelize.col("city"),
                            ", ",
                            sequelize.col("state"),
                            ", ",
                            sequelize.col("zipCode")
                        ),
                        "Address",
                    ],
                ],
                where: {
                    physicianId: {
                        [Op.not]: null,
                    },
                    deletedAt: null,
                },
            },
            active: {
                attributes: [
                    [
                        sequelize.fn(
                            "CONCAT",
                            sequelize.col("patientFirstName"),
                            " ",
                            sequelize.col("patientLastName")
                        ),
                        "Name",
                    ],
                    ["dob", "Date Of Birth"],
                    [
                        sequelize.fn(
                            "CONCAT",
                            sequelize.col("requestType"),
                            " ",
                            sequelize.col("requestorFirstName"),
                            " ",
                            sequelize.col("requestorLastName")
                        ),
                        "Requestor",
                    ],
                    [
                        sequelize.fn(
                            "CONCAT",
                            sequelize.col("User.firstName"),
                            " ",
                            sequelize.col("User.lastName")
                        ),
                        "Physician Name",
                    ],
                    ["updatedAt", "Date Of Service"],
                    ["patientPhoneNumber", "Phone"],
                    [
                        sequelize.fn(
                            "CONCAT",
                            sequelize.col("street"),
                            ", ",
                            sequelize.col("city"),
                            ", ",
                            sequelize.col("state"),
                            ", ",
                            sequelize.col("zipCode")
                        ),
                        "Address",
                    ],
                ],
                where: {
                    isAgreementSent: true,
                    physicianId: {
                        [Op.not]: null,
                    },
                    deletedAt: null,
                },
            },
            conclude: {
                attributes: [
                    [
                        sequelize.fn(
                            "CONCAT",
                            sequelize.col("patientFirstName"),
                            " ",
                            sequelize.col("patientLastName")
                        ),
                        "Name",
                    ],
                    ["dob", "Date Of Birth"],
                    [
                        sequelize.fn(
                            "CONCAT",
                            sequelize.col("User.firstName"),
                            " ",
                            sequelize.col("User.lastName")
                        ),
                        "Physician Name",
                    ],
                    ["updatedAt", "Date Of Service"],
                    ["patientPhoneNumber", "Phone"],
                    [
                        sequelize.fn(
                            "CONCAT",
                            sequelize.col("street"),
                            ", ",
                            sequelize.col("city"),
                            ", ",
                            sequelize.col("state"),
                            ", ",
                            sequelize.col("zipCode")
                        ),
                        "Address",
                    ],
                ],
                where: {
                    completedByPhysician: true,
                    deletedAt: null,
                },
            },
            toClose: {
                attributes: [
                    [
                        sequelize.fn(
                            "CONCAT",
                            sequelize.col("patientFirstName"),
                            " ",
                            sequelize.col("patientLastName")
                        ),
                        "Name",
                    ],
                    ["dob", "Date Of Birth"],
                    ["regionName", "Region"],
                    [
                        sequelize.fn(
                            "CONCAT",
                            sequelize.col("User.firstName"),
                            " ",
                            sequelize.col("User.lastName")
                        ),
                        "Physician Name",
                    ],
                    ["updatedAt", "Date Of Service"],
                    [
                        sequelize.fn(
                            "CONCAT",
                            sequelize.col("street"),
                            ", ",
                            sequelize.col("city"),
                            ", ",
                            sequelize.col("state"),
                            ", ",
                            sequelize.col("zipCode")
                        ),
                        "Address",
                    ],
                    ["patientNote", "Notes"],
                ],
                where: {
                    caseTagPhysician: "Completed",
                    deletedAt: null,
                },
            },
        };

        // get the options for the given state, or use the default options for "new" state
        const options = stateOptions[state] || stateOptions["new"];

        // sequelize query to get patient information
        const newPatient = await Request.findAll({
            ...options, // spread the options object to get the attributes and the where clause
            include: [
                {
                    model: User,
                    attributes: [], // exclude the User attributes, only use them for joining
                },
            ],
        });

        return res.json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: newPatient,
        });
    } catch (error: any) {
        throw error;
    }
};
