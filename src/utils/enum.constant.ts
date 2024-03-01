export enum RequestType {
    Patient = "Patient",
    Family = "Relative/Family",
    Concierge = "Concierge",
    BusinessPartner = "BusinessPartner",
}

export enum AccountType {
    Admin = "Admin",
    Physician = "Physician",
    User = "User",
}

export enum CaseTag {
    New = "New",
    Pending = "Pending",
    Active = "Active",
    Conclude = "Conclude",
    Close = "Close",
    UnPaid = "UnPaid",
}

export enum ProfileStatus {
    Pending = "Pending",
    Active = "Active",
    Inactive = "Inactive",
}

export enum RequestStatus {
    Unassigned = "Unassigned",
    Accepted = "Accepted",
    Cancelled = "Cancelled",
    Reserving = "Reserving",
    MDOnRoute = "MDOnRoute",
    Conclude = "Conclude",
    MDOnSite = "MDOnSite",
    FollowUp = "FollowUp",
    Closed = "Closed",
    Locked = "Locked",
    Declined = "Declined",
    Consult = "Consult",
    Clear = "Clear",
    CancelledByProvider = "CancelledByProvider",
    CancelledByAdmin = "CancelledByAdmin",
    CCUploadedByClient = "CCUploadedByClient",
    CCApprovedByAdmin = "CCApprovedByAdmin",
}

export enum OnCallStatus {
    UnAvailable = "Unavailable",
    OnCall = "OnCall",
    Busy = "Busy",
}

export enum CallType {
    HouseCall = "HouseCall",
    Consult = "Consult",
}
