"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var EmailController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const email_service_1 = require("./email.service");
const send_email_dto_1 = require("./dto/send-email.dto");
const notification_interface_1 = require("../shared/interfaces/notification.interface");
let EmailController = EmailController_1 = class EmailController {
    constructor(emailService) {
        this.emailService = emailService;
        this.logger = new common_1.Logger(EmailController_1.name);
    }
    async handleEmailNotification(data) {
        this.logger.log(`Received message for email notification: ${data.request_id}`);
        if (!data.request_id || !data.user_id || !data.template_code) {
            this.logger.error('Missing required fields in notification data');
            throw new Error('Invalid notification data: missing required fields');
        }
        try {
            await this.emailService.sendEmail(data);
            await this.emailService.updateNotificationStatus(data.request_id, notification_interface_1.NotificationStatus.DELIVERED);
            this.logger.log(`Successfully processed email notification: ${data.request_id}`);
        }
        catch (error) {
            this.logger.error(`Failed to process email notification: ${data.request_id}`, error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            await this.emailService.updateNotificationStatus(data.request_id, notification_interface_1.NotificationStatus.FAILED, errorMessage);
            throw error;
        }
    }
};
exports.EmailController = EmailController;
__decorate([
    (0, microservices_1.MessagePattern)('email.queue'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_email_dto_1.SendEmailDto]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "handleEmailNotification", null);
exports.EmailController = EmailController = EmailController_1 = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true
    })),
    __metadata("design:paramtypes", [email_service_1.EmailService])
], EmailController);
//# sourceMappingURL=email.controller.js.map