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
var NotificationsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const create_notification_dto_1 = require("./dto/create-notification.dto");
const rabbitmq_service_1 = require("../rabbitmq/rabbitmq.service");
const uuid_1 = require("uuid");
let NotificationsController = NotificationsController_1 = class NotificationsController {
    rabbitMQService;
    logger = new common_1.Logger(NotificationsController_1.name);
    constructor(rabbitMQService) {
        this.rabbitMQService = rabbitMQService;
    }
    async sendNotification(createNotificationDto) {
        try {
            this.logger.log(`Received notification request: ${createNotificationDto.request_id}`);
            await this.validateNotificationRequest(createNotificationDto);
            const routingKey = createNotificationDto.notification_type;
            const notificationId = (0, uuid_1.v4)();
            const message = {
                ...createNotificationDto,
                notification_id: notificationId,
                timestamp: new Date().toISOString(),
            };
            const sent = await this.rabbitMQService.publishToExchange(routingKey, message);
            if (!sent) {
                throw new Error('Failed to queue notification');
            }
            this.logger.log(`Notification routed to ${routingKey} queue: ${notificationId}`);
            const responseData = {
                notification_id: notificationId,
                status: 'pending',
                request_id: createNotificationDto.request_id,
            };
            return {
                success: true,
                data: responseData,
                message: 'Notification queued successfully',
            };
        }
        catch (error) {
            this.logger.error(`Failed to process notification: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                error: error.message,
                message: 'Failed to process notification request',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async validateNotificationRequest(dto) {
        if (!dto.request_id) {
            throw new Error('request_id is required for idempotency');
        }
        if (!dto.user_id) {
            throw new Error('user_id is required');
        }
    }
    health() {
        return {
            success: true,
            data: {
                status: 'OK',
                timestamp: new Date().toISOString(),
            },
            message: 'API Gateway is healthy',
        };
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Send a notification' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Notification queued successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request data' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_notification_dto_1.CreateNotificationDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "sendNotification", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'API Gateway health check' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], NotificationsController.prototype, "health", null);
exports.NotificationsController = NotificationsController = NotificationsController_1 = __decorate([
    (0, swagger_1.ApiTags)('notifications'),
    (0, common_1.Controller)('api/v1/notifications'),
    __metadata("design:paramtypes", [rabbitmq_service_1.RabbitMQService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map