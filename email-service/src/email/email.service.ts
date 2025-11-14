import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import { NotificationMessage, NotificationStatus, ApiResponse } from '../shared/interfaces/notification.interface';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface UserResponse {
  id: string;
  email: string;
  name: string;
  preferences: {
    email: boolean;
    push: boolean;
  };
}

interface TemplateResponse {
  id: string;
  code: string;
  subject: string;
  content: string;
  language: string;
  version: number;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter!: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    const emailConfig: EmailConfig = {
      host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: this.configService.get<boolean>('SMTP_SECURE', false),
      auth: {
        user: this.configService.get<string>('SMTP_USER', ''),
        pass: this.configService.get<string>('SMTP_PASS', ''),
      },
    };

    this.transporter = nodemailer.createTransport(emailConfig);

    // Verify connection
    this.transporter.verify()
      .then(() => this.logger.log('SMTP connection verified'))
      .catch((error) => this.logger.error('SMTP connection failed', error));
  }

  async sendEmail(data: NotificationMessage): Promise<void> {
    try {
      this.logger.log(`Processing email notification: ${data.request_id}`);

      // Get user details (mock for now - implement actual HTTP call later)
      const user = await this.getUserDetails(data.user_id);
      
      if (!user.preferences.email) {
        this.logger.warn(`User ${data.user_id} has disabled email notifications`);
        return;
      }

      // Get template (mock for now)
      const template = await this.getTemplate(data.template_code);
      
      // Compile template with variables
      const compiledTemplate = this.compileTemplate(template.content, data.variables);
      const subject = this.compileTemplate(template.subject, data.variables);

      const mailOptions: nodemailer.SendMailOptions = {
        from: this.configService.get<string>('FROM_EMAIL', 'noreply@example.com'),
        to: user.email,
        subject: subject,
        html: compiledTemplate,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully for request: ${data.request_id}`);
      
    } catch (error) {
      this.logger.error(`Failed to send email for request: ${data.request_id}`, error);
      throw error;
    }
  }

  private async getUserDetails(userId: string): Promise<UserResponse> {
    // Mock implementation - replace with actual HTTP call to User Service
    this.logger.log(`Fetching user details for: ${userId}`);
    
    return {
      id: userId,
      email: 'test@example.com',
      name: 'Test User',
      preferences: {
        email: true,
        push: true,
      },
    };
  }

  private async getTemplate(templateCode: string): Promise<TemplateResponse> {
    // Mock implementation - replace with actual HTTP call to Template Service
    this.logger.log(`Fetching template: ${templateCode}`);
    
    return {
      id: '1',
      code: templateCode,
      subject: 'Welcome {{name}}!',
      content: `
        <html>
          <body>
            <h1>Hello {{name}}!</h1>
            <p>Welcome to our platform. Your link is: <a href="{{link}}">here</a></p>
          </body>
        </html>
      `,
      language: 'en',
      version: 1,
    };
  }

  private compileTemplate(template: string, variables: Record<string, any>): string {
    try {
      const compiledTemplate = handlebars.compile(template);
      return compiledTemplate(variables);
    } catch (error) {
      this.logger.error('Template compilation failed:', error);
       const errorMessage = error instanceof Error ? error.message : 'Unknown template compilation error';
      throw new Error(`Template compilation error: ${errorMessage}`);
    }
  }

  async updateNotificationStatus(
    requestId: string, 
    status: NotificationStatus, 
    error?: string
  ): Promise<void> {
    // Mock implementation - replace with actual HTTP call to API Gateway
    this.logger.log(`Updating notification status for ${requestId}: ${status}`);
    
    if (error) {
      this.logger.error(`Error details: ${error}`);
    }
  }
}