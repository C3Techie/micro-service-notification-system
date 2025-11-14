export declare enum NotificationType {
    EMAIL = "email",
    PUSH = "push"
}
export declare enum NotificationStatus {
    PENDING = "pending",
    DELIVERED = "delivered",
    FAILED = "failed"
}
export interface NotificationMessage {
    notification_type: NotificationType;
    user_id: string;
    template_code: string;
    variables: Record<string, any>;
    request_id: string;
    priority: number;
    metadata?: Record<string, any>;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message: string;
    meta?: PaginationMeta;
}
export interface PaginationMeta {
    total: number;
    limit: number;
    page: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
}
