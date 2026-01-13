export interface EventDataProp {
    _id: string;
    title: string;
    date: Date;
    time: string;
    location: string;
    attendees:number;
    expectedAttendees: number
    price:number;
    description: string;
    status: 'pending'|'approved'|'rejected';
    category: 'Arts & Science' |'Engineering'| 'Agriculture' |'Pharmacy'|'Physiotherapy'|'Allied Health Sciences'|'Hotel Management'| 'Business'
    hasSubmittedFeedback?: boolean;
    image?: string;
    ticketId?: string; // Optional ticket ID for registered events
}