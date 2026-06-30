import axios, { AxiosRequestConfig, AxiosResponse } from "axios";


const API_BASE_URL = process.env.NEXT_PUBLIC_BROKERAGE_SERVICE_API ?? 'https://brokerage-service.paidiver.site';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    paramsSerializer: {
        indexes: null
    }
})

export interface RequestOptions extends Omit<AxiosRequestConfig, 'method' | 'url'> {
    method: AxiosRequestConfig['method'];
    url: string;
    queryParams?: Record<string, string | number | boolean | string[] | number[] | boolean[]>;
    data?: unknown;
    responseType?: 'json' | 'blob' | 'arraybuffer' | 'text';
}

export const apiRequest = async <T>({
    method,
    url,
    queryParams,
    data,
    responseType,
    ...extraConfig}: RequestOptions
): Promise<T> => {
  const response: AxiosResponse<T> = await apiClient({
    method,
    url,
    params: queryParams,
    data: data,
    responseType: responseType ?? 'json',
    ...extraConfig
  });

  return response.data;
};


interface DownloadProps extends Omit<AxiosRequestConfig, 'url' | 'responseType'> {
  url: string;
  defaultFilename?: string;
}


export const downloadFile = async ({
    url,
    defaultFilename = 'download.zip',
    ...extraConfig
}: DownloadProps): Promise<void> => {
    try {
        const fileBlob = await apiRequest<Blob>({
        url,
        method: 'GET',
        responseType: 'blob',
        ...extraConfig,
        });

        const downloadUrl = window.URL.createObjectURL(fileBlob);
        const link = document.createElement('a');
        
        link.href = downloadUrl;
        link.setAttribute('download', defaultFilename);
        
        document.body.appendChild(link);
        link.click();
        
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
        
    } catch (error) {
        console.error(`Failed to download:`, error);
        throw error;
    }
};
