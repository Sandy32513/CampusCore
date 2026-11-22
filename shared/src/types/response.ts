export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiFieldError {
  field: string;
  issue: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiFieldError[];
    requestId?: string;
  };
}
