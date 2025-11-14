import { NotificationType } from '../../shared/interfaces/notification.interface';
export declare class SendEmailDto {
    notification_type?: NotificationType;
    user_id?: string;
    template_code?: string;
    variables?: Record<string, any>;
    request_id?: string;
    priority?: number;
    metadata?: Record<string, any>;
}
