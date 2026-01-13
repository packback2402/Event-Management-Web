import mongoose ,{ Document,ObjectId,Schema } from 'mongoose';


export interface ITicket extends Document {
  quantity:number;
  totalPrice:number;
  eventId: ObjectId;
  userId:ObjectId;
  bookedAt: Date;
  status:"booked"|"cancelled"|"nothing";
}

const TicketSchema = new Schema<ITicket>(
    {
        quantity:{type:Number,required:true},
        totalPrice:{type:Number,required:true},
        eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
        userId:{type:Schema.Types.ObjectId, ref:'User', required:true},
        bookedAt: { type: Date, default: Date.now },
        status:{type:String, enum:["booked", "cancelled", "nothing"], default:"nothing"}
    },
    { timestamps: true
    }
)

export default mongoose.model<ITicket>('Ticket', TicketSchema);