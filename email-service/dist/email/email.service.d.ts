import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { NotificationMessage, NotificationStatus } from '../shared/interfaces/notification.interface';
export declare class EmailService {
    private readonly configService;
    private readonly httpService;
    private readonly logger;
    private transporter;
    constructor(configService: ConfigService, httpService: HttpService);
    private initializeTransporter;
    sendEmail(data: NotificationMessage): Promise<void>;
    private getUserDetails;
    private getTemplate;
    private compileTemplate;
    updateNotificationStatus(requestId: string, status: NotificationStatus, error?: string): Promise<void>;
}
