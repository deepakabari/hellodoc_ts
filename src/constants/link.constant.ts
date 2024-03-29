const linkConstant = {
    PASSWORD_REGEX:
        '^(?=.*[!@#$%^&*(),.?:{}|<>])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,16}$',
    RESET_URL: 'http://localhost:3000/auth/resetPassword/',
    AGREEMENT_URL: 'http://localhost:3000/agreement',
    REQUEST_URL: 'http://localhost:3000/createRequest',
    CREATE_ACCOUNT_URL: 'http://localhost:3000/createAccount',
    agreementSubject: 'Action Required: Review and Sign Your Agreement',
    createRequestSubject: 'Create your first request at HalloDoc Platform',
    contactSubject: 'I want to contact you for my treatment',
    createAccountSubject: 'Complete Your Account Creation in our platform',
};

export default linkConstant;
