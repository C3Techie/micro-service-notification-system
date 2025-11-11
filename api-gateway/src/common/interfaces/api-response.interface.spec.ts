import { ApiResponse, PaginationMeta } from './api-response.interface';

describe('ApiResponse Interface', () => {
  it('should allow creating valid ApiResponse objects', () => {
    const successResponse: ApiResponse<string> = {
      success: true,
      data: 'test data',
      message: 'Success message'
    };

    const errorResponse: ApiResponse<null> = {
      success: false,
      error: 'Error occurred',
      message: 'Error message'
    };

    const paginatedResponse: ApiResponse<string[]> = {
      success: true,
      data: ['item1', 'item2'],
      message: 'Paginated data',
      meta: {
        total: 100,
        limit: 10,
        page: 1,
        total_pages: 10,
        has_next: true,
        has_previous: false
      }
    };

    expect(successResponse.success).toBe(true);
    expect(errorResponse.success).toBe(false);
    expect(paginatedResponse.meta?.total_pages).toBe(10);
  });

  it('should enforce PaginationMeta structure', () => {
    const meta: PaginationMeta = {
      total: 50,
      limit: 10,
      page: 2,
      total_pages: 5,
      has_next: true,
      has_previous: true
    };

    expect(meta.has_next).toBe(true);
    expect(meta.total_pages).toBe(5);
  });
});