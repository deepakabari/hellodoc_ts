export enum RequestType {
    Patient = 'Patient',
    Family = 'Family/Friend',
    Concierge = 'Concierge',
    Business = 'Business',
    Admin = 'Admin',
    Physician = 'Physician',
    User = 'User',
    SomeoneElse = 'SomeoneElse',
}

export enum AccountType {
    Admin = 'Admin',
    Physician = 'Physician',
    User = 'User',
    Vendor = 'Vendor',
    All = 'All',
}

export enum CaseTag {
    New = 'New',
    Pending = 'Pending',
    Active = 'Active',
    Conclude = 'Conclude',
    Close = 'To Close',
    UnPaid = 'UnPaid',
}

export enum RegionAbbreviation {
    District_Of_Columbia = 'DC',
    Maryland = 'MD',
    NewYork = 'NY',
    Virginia = 'VA',
}

export enum ProfileStatus {
    Pending = 'Pending',
    Active = 'Active',
    Inactive = 'Inactive',
}

export enum RequestStatus {
    Unassigned = 'Unassigned',
    Processing = 'Processing',
    Accepted = 'Accepted',
    Cancelled = 'Cancelled',
    Reserving = 'Reserving',
    MDOnRoute = 'MDOnRoute',
    Conclude = 'Conclude',
    MDOnSite = 'MDOnSite',
    FollowUp = 'FollowUp',
    Closed = 'Closed',
    Locked = 'Locked',
    Declined = 'Declined',
    Consult = 'Consult',
    Cleared = 'Cleared',
    Blocked = 'Blocked',
    UnPaid = 'Unpaid',
    CancelledByProvider = 'CancelledByProvider',
    CancelledByAdmin = 'CancelledByAdmin',
    CCUploadedByClient = 'CCUploadedByClient',
    CCApprovedByAdmin = 'CCApprovedByAdmin',
}

export enum OnCallStatus {
    UnScheduled = 'UnScheduled',
    Available = 'Available',
    UnAvailable = 'Unavailable',
    OnCall = 'OnCall',
    Busy = 'Busy',
}

export enum CallType {
    HouseCall = 'HouseCall',
    Consult = 'Consult',
}

export enum AllowedMimetype {
    'image/png',
    'image/jpg',
    'image/jpeg',
    'application/pdf',
}

export enum PhoneType {
    Mobile = 'Mobile',
    Phone = 'Phone',
    Landline = 'Landline',
}
