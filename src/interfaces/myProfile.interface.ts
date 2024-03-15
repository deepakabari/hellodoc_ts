type AdminUpdates = {
    firstName?: string;
    lastName?: string;
    email?: string;
    confirmEmail?: string;
    phoneNumber?: string;
};

type BillingUpdates = {
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    altPhone?: string;
};

export { AdminUpdates, BillingUpdates }