import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription } from 'rxjs';
import Stripe from 'stripe';
import { SubscriptionDocument, SubscriptionSchema } from './subscriptionPayment.schema';

@Injectable()
export class PaymentsService {
  private stripe;

  constructor(@InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>) {
    this.stripe = new Stripe(process.env.API_SECRET_KEY, {
      apiVersion: '2020-08-27',
    });
  }

  async createPayment(paymentRequestBody: any): Promise<any> {
    try {
      let sumAmount = 0;
      paymentRequestBody.products.forEach((product) => {
        sumAmount = sumAmount + product.price * product.quantity;
      });
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: sumAmount * 100,
        currency: paymentRequestBody.currency,
        automatic_payment_methods: {
          enabled: true,
        },
        confirm: true,
        payment_method: paymentRequestBody.payment_method,
        return_url: 'http://localhost:3000/return_url'
      });
      return paymentIntent;
    } catch (e) {
      let errorMsg;
      switch (e.type) {
        case 'StripeCardError':
          console.log(`A payment error occurred: ${e.message}`);
          errorMsg = `A payment error occurred: ${e.message}`
          break;
        case 'StripeInvalidRequestError':
          console.log('An invalid request occurred.');
          errorMsg = 'An invalid request occurred.'
          break;
        default:
          console.log('Another problem occurred, maybe unrelated to Stripe.');
          errorMsg = 'Another problem occurred, maybe unrelated to Stripe.'
          break;
      }
      return errorMsg;
    }

  }

  async stripeSession(plan) {
    try {
      const session = await this.stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: plan,
            quantity: 1
          }
        ],
        success_url: "http://localhost:3000/success.html",
        cancel_url: "http://localhost:3000/cancel.html",
      });
      return session;
    } catch (e) {
      return e;
    }
  };

  async createSubscription(createSubscriptionRequest: any): Promise<any> {

    // create a stripe customer
    const customer = await this.stripe.customers.create({
      // name: createSubscriptionRequest.name,
      email: createSubscriptionRequest.email,
      payment_method: createSubscriptionRequest.paymentMethod,
      invoice_settings: {
        default_payment_method: createSubscriptionRequest.paymentMethod,
      },
    });

    const priceId = 'price_1MU20vSAr7bgYV8eI4sZXJKn';

    const subscription = await this.stripe.subscriptions.create({
      customer: customer.id,
      items: [{ plan: priceId }],
      expand: ['latest_invoice.payment_intent'],
    });

    const saveSubscriptionDetails = new this.subscriptionModel({
      customerId: customer.id,
      plan: priceId,
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      startDate: subscription.start_date,
      // source: customer.source,
    });

    await saveSubscriptionDetails.save();
    // return the client secret and subscription id
    return {
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      subscriptionId: subscription.id,
      status: subscription.latest_invoice.payment_intent.status
    };
  }
}
