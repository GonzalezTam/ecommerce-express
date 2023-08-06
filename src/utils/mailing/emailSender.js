import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';
import dotEnvConfig from '../../config/env.config.js';

const { GMAIL_USER, GMAIL_PASSWORD } = dotEnvConfig;

const config = {
  service: 'gmail',
  auth: { user: GMAIL_USER, pass: GMAIL_PASSWORD }
};
const transporter = nodemailer.createTransport(config);

const MailGenerator = new Mailgen({
  theme: 'default',
  product: {
    name: 'node e-commerce',
    link: 'http://localhost:3000/'
  }
});

const parseEmailData = async (type, data) => {
  let subject;
  let template;

  switch (type) {
    // case 'register':
    case 'forgot_password':
      subject = 'Reset password';
      template = {
        body: {
          name: data.user.firstName,
          intro: 'You have received this email because a password reset request for your account was received.',
          action: {
            instructions: 'Click the button below to reset your password:',
            button: {
              color: '#33b5e5',
              text: 'Reset your password',
              link: `http://localhost:3000/reset-password/${data.token}`
            }
          },
          outro: 'If you did not request a password reset, no further action is required on your part.',
          signature: false
        }
      };
      break;
    case 'reset_password':
      subject = 'Password changed';
      template = {
        body: {
          name: data.user.firstName,
          intro: 'This is a confirmation that the password for your account has just been changed.',
          outro: 'If you did not make this change, please contact us immediately.',
          signature: false
        }
      };
      break;
    case 'order_success':
      subject = 'Order created';
      template = {
        body: {
          name: data.user.firstName,
          intro: `Order ${data.order.ticket.code} was created successfully.`,
          table: {
            data: data.order.operations.successfullyBought.map((item) => {
              return {
                product: item.product,
                x: item.quantityBought,
                subtotal: `$${item.price * item.quantityBought}`
              };
            })
          },
          outro: `Total: $${data.order.ticket.amount}. Thank you for your purchase.`,
          signature: false
        }
      };
      break;
    case 'order_failed':
      subject = 'Order failed';
      template = {
        body: {
          name: data.user.firstName,
          intro: 'It was not possible to create your order. Sorry for the inconvenience.',
          outro: 'Please contact an administrator. Thank you.',
          signature: false
        }
      };
      break;
    default:
      subject = 'Test email';
      template = {};
      break;
  }
  return { subject, template };
};

export const emailSender = async (type, data) => {
  try {
    const { subject, template } = await parseEmailData(type, data);
    const htmlTemplate = MailGenerator.generate(template);
    const mailOptions = {
      from: GMAIL_USER,
      to: data.user.email,
      subject,
      html: htmlTemplate
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    return error;
  }
};
