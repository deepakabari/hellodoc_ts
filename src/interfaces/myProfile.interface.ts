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

type FieldUpdates = {
    password?: string;
    status?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    medicalLicense?: string;
    NPINumber?: string;
    syncEmailAddress?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    altPhone?: string;
    photo?: string;
    signature?: string;
};

export { AdminUpdates, BillingUpdates, FieldUpdates };
