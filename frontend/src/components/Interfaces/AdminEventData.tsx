export interface AdminEventData {
    _id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    expectedAttendees: number;
    attendees: number;
    price: number;
    description: string;
    organizerId: string;
    status: 'pending' | 'approved' | 'rejected';
    category?: 'Arts & Science' | 'Engineering' | 'Agriculture' | 'Pharmacy' | 'Physiotherapy' | 'Allied Health Sciences' | 'Hotel Management' | 'Business';
    createdAt: string;
    updatedAt: string;
}

export interface AdminEventResponse {
    message?: string;
    data: AdminEventData[];
}

export interface AdminEventActionResponse {
    message: string;
    data: AdminEventData;
}
