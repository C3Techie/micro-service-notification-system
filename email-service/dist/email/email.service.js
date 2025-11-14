"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const nodemailer = __importStar(require("nodemailer"));
const handlebars = __importStar(require("handlebars"));
let EmailService = EmailService_1 = class EmailService {
    constructor(configService, httpService) {
        this.configService = configService;
        this.httpService = httpService;
        this.logger = new common_1.Logger(EmailService_1.name);
        this.initializeTransporter();
    }
    initializeTransporter() {
        const emailConfig = {
            host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
            port: this.configService.get('SMTP_PORT', 587),
            secure: this.configService.get('SMTP_SECURE', false),
            auth: {
                user: this.configService.get('SMTP_USER', ''),
                pass: this.configService.get('SMTP_PASS', ''),
            },
        };
        this.transporter = nodemailer.createTransport(emailConfig);
        this.transporter.verify()
            .then(() => this.logger.log('SMTP connection verified'))
            .catch((error) => this.logger.error('SMTP connection failed', error));
    }
    async sendEmail(data) {
        try {
            this.logger.log(`Processing email notification: ${data.request_id}`);
            const user = await this.getUserDetails(data.user_id);
            if (!user.preferences.email) {
                this.logger.warn(`User ${data.user_id} has disabled email notifications`);
                return;
            }
            const template = await this.getTemplate(data.template_code);
            const compiledTemplate = this.compileTemplate(template.content, data.variables);
            const subject = this.compileTemplate(template.subject, data.variables);
            const mailOptions = {
                from: this.configService.get('FROM_EMAIL', 'noreply@example.com'),
                to: user.email,
                subject: subject,
                html: compiledTemplate,
            };
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`Email sent successfully for request: ${data.request_id}`);
        }
        catch (error) {
            this.logger.error(`Failed to send email for request: ${data.request_id}`, error);
            throw error;
        }
    }
    async getUserDetails(userId) {
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
    async getTemplate(templateCode) {
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
    compileTemplate(template, variables) {
        try {
            const compiledTemplate = handlebars.compile(template);
            return compiledTemplate(variables);
        }
        catch (error) {
            this.logger.error('Template compilation failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown template compilation error';
            throw new Error(`Template compilation error: ${errorMessage}`);
        }
    }
    async updateNotificationStatus(requestId, status, error) {
        this.logger.log(`Updating notification status for ${requestId}: ${status}`);
        if (error) {
            this.logger.error(`Error details: ${error}`);
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        axios_1.HttpService])
], EmailService);
//# sourceMappingURL=email.service.js.map