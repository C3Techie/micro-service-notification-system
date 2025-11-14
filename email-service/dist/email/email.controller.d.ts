import { EmailService } from './email.service';
import { SendEmailDto } from './dto/send-email.dto';
export declare class EmailController {
    private readonly emailService;
    private readonly logger;
    constructor(emailService: EmailService);
    handleEmailNotification(data: SendEmailDto): Promise<void>;
}
