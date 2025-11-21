'use client'

import React, { useCallback, memo } from 'react';
import ReactPaginate from 'react-paginate';

interface Props {
    pageCount: number
    onPageChange: (selected: number) => void;
    forcePage?: number;
}

const HandlePagination: React.FC<Props> = ({ pageCount, onPageChange, forcePage }) => {
    // 使用useCallback来稳定onPageChange处理函数，避免不必要的重新渲染
    const handlePageChange = useCallback((selectedItem: { selected: number }) => {
        console.log('Pagination: Changing to page', selectedItem.selected + 1);
        onPageChange(selectedItem.selected);
    }, [onPageChange]);

    return (
        <ReactPaginate
            previousLabel="<"
            nextLabel=">"
            pageCount={pageCount}
            pageRangeDisplayed={3}
            marginPagesDisplayed={2}
            onPageChange={handlePageChange}
            forcePage={forcePage}
            containerClassName={'pagination'}
            activeClassName={'active'}
            disableInitialCallback={false}
        />
    );
};

// 使用React.memo包装组件，避免不必要的重新渲染
export default memo(HandlePagination);
