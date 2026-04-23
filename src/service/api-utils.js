export const getApiData = (response, fallback = null) => response?.data ?? fallback;

export const getApiMessage = (response, fallback = 'Operação realizada com sucesso.') => response?.msg || fallback;

export const getApiErrorMessage = (error, fallback = 'Ocorreu um erro ao processar a solicitação.') =>
    error?.response?.data?.msg || error?.message || fallback;
