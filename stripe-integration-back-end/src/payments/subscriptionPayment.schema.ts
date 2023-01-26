import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type SubscriptionDocument = Subscription & Document;
@Schema({
    timestamps: true
})

export class Subscription {
    @Prop({ required: true })
    customerId: string

    @Prop({ required: true })
    plan: string

    @Prop({ required: true })
    stripeSubscriptionId: string

    @Prop({ required: true })
    startDate: Date

    @Prop()
    endDate: Date
}
export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);