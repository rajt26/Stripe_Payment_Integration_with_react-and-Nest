import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { SubscriptionSchema } from './subscriptionPayment.schema';

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost:27017/paymentgateway_db'), MongooseModule.forFeature([{ name: 'Subscription', schema: SubscriptionSchema }])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule { }
