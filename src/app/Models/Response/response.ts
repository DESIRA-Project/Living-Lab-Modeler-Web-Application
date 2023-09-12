export interface Response<T>{
    data: T;
    message: string;
}

export interface MessageResponse{
    message: string;
}

export interface PageResponse<T> {
  data: T[];
  totalCount: number;
}
