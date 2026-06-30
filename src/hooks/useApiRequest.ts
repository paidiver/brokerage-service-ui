import { AxiosError } from 'axios'
import { useCallback,useState } from 'react'

import { apiRequest, RequestOptions } from '../app/api/apiClient'


type RequestStatus = 'idle' | 'loading' | 'success' | 'validationError' | 'serverError' | 'empty'
interface UseApiRequestState<T> {
    data: T | null
    status: RequestStatus
    error: string | null
}


function checkIfEmpty(data: unknown): boolean {
  if (!data) return true;

  if (Array.isArray(data)) return data.length === 0;

  if (typeof data === 'object') {
    if ('count' in data && data.count === 0) return true;
    
    if ('results' in data) {
      if (Array.isArray(data.results)) return data.results.length === 0;      
    }

    if ('sources' in data && Array.isArray(data.sources)) {
      return data.sources.length === 0;
    }
  }

  return false;
}

export function useApiRequest<T>() {
    const [state, setState] = useState<UseApiRequestState<T>>({
        data: null,
        status: 'idle',
        error: null
    })

    const makeRequest = useCallback(async (requestOptions: RequestOptions) => {
        setState({ data: null, status: 'loading', error: null })

        try {
            const responseData = await apiRequest<T>(requestOptions)
            const isDataEmpty = checkIfEmpty(responseData);

            setState({
                data: responseData,
                status: isDataEmpty ? 'empty' : 'success',
                error: isDataEmpty ? 'No data returned from API' : null
            })
        } catch (error: AxiosError | unknown) {
            const axiosError = error as AxiosError<{ message?: string}>;

            const statusCode = axiosError.response?.status;
            
            setState({
                data: null,
                status: statusCode === 422 ? 'validationError' : statusCode && statusCode >= 500 ? 'serverError' : 'idle',
                error: 
                    statusCode === 422
                    ? axiosError.response?.data?.message ?? 'Invalid request parameters.'
                    : 'Something went wrong. Please try again later.',
            });
        }
    }, [])
    return { ...state, makeRequest }
}