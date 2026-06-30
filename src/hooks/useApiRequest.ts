import { AxiosError } from 'axios'
import { useState } from 'react'

import { apiRequest, RequestOptions } from '../app/api/apiClient'


type RequestStatus = 'idle' | 'loading' | 'success' | 'validationError' | 'serverError' | 'empty'
interface UseApiRequestState<T> {
    data: T | null
    status: RequestStatus
    error: AxiosError | null
}

interface MakeRequestOptions<T> extends RequestOptions {
    isEmpty?: (data: T) => boolean
}

export function useApiRequest<T>() {
    const [state, setState] = useState<UseApiRequestState<T>>({
        data: null,
        status: 'idle',
        error: null
    })

    const makeRequest = async ({ isEmpty, ...requestOptions }: MakeRequestOptions<T>) => {
        setState({ data: null, status: 'loading', error: null })

        try {
            const responseData = await apiRequest<T>(requestOptions)
            const emptyData = isEmpty ? isEmpty(responseData) : false;

            setState({
                data: responseData,
                status: emptyData ? 'empty' : 'success',
                error: null
            })
        } catch (error) {
            // Handle AxiosError
        }
    }
    return { ...state, makeRequest }
}