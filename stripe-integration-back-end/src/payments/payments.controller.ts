import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Response } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentService: PaymentsService) { }

  @Post()
  createPayments(
    @Res() response: Response,
    @Body() paymentRequestBody: any,
  ) {
    this.paymentService
      .createPayment(paymentRequestBody)
      .then((res) => {
        response.status(HttpStatus.CREATED).json(res);
      })
      .catch((err) => {
        console.log(err);

        response.status(HttpStatus.BAD_REQUEST).json(err);
      });
  }

  @Post('/checkout-session')
  checkoutSession(
    @Res() response: Response,
    @Body() paymentRequestBody: any,
  ) {
    this.paymentService
      .stripeSession(paymentRequestBody.plan)
      .then((res) => {
        response.status(HttpStatus.OK).json(res);
      })
      .catch((err) => {
        response.status(HttpStatus.BAD_REQUEST).json(err);
      });
  }

  @Post('/subscribe')
  createSubscription(
    @Res() response: Response,
    @Body() paymentRequestBody: any,
  ) {
    this.paymentService
      .createSubscription(paymentRequestBody)
      .then((res) => {
        response.status(HttpStatus.OK).json(res);
      })
      .catch((err) => {
        response.status(HttpStatus.BAD_REQUEST).json(err);
      });
  }
}
