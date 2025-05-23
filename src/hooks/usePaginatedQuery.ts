import { useState, useEffect, useCallback } from 'react';

interface PaginatedResponse<T> {
    data: T[];
    nextPage: number | null;
    previousPage: number | null;
}

function usePaginatedQuery<T>(url: string) {
    const [data, setData] = useState<T[]>([]);
    const [nextPage, setNextPage] = useState<number | null>(1);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchPage = useCallback(async (page: number) => {
        if (!page) return;
        setLoading(true);
        try {
            const response = await fetch(`${url}?page=${page}`);
            if (response.ok) {
                const result: PaginatedResponse<T> = await response.json();
                setData(result.data);
                setNextPage(result.nextPage);
            } else {
                console.log(response)
            }

        } catch (error) {
            console.error('Error fetching paginated data:', error);
        } finally {
            setLoading(false);
        }
    }, [url]);

    useEffect(() => {
        if (nextPage === 1) fetchPage(1);
    }, [nextPage, fetchPage]);

    return {
        data,
        nextPage,
        loading,
        fetchNextPage: () => fetchPage(nextPage!),
    };
}

export default usePaginatedQuery;
