import nodemailer from 'nodemailer';
export declare function createEmailTransporter(): Promise<nodemailer.Transporter<any, nodemailer.TransportOptions>>;
export declare function sendWelcomeEmail(to: string, ownerName: string, storeName: string, tempPassword: string, subdomain: string): Promise<string>;
//# sourceMappingURL=email.d.ts.map