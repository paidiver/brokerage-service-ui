import axios, { AxiosResponse} from "axios";


const API_BASE_URL = process.env.NEXT_PUBLIC_BROKERAGE_SERVICE_API ?? 'https://brokerage-service.paidiver.site';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
})

interface RequestOptions {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url: string;
    queryParams?: Record<string, string | number | boolean>;
    data?: any;
}

export const apiRequest = async <T>({
    method,
    url,
    queryParams,
    data}: RequestOptions
): Promise<T> => {
  const response: AxiosResponse<T> = await apiClient({
    method,
    url,
    params: queryParams,
    data,
  });

  return response.data;
};
