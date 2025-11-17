import { useState, useEffect, useCallback } from 'react';

const useLoginPopup = () => {
    const [openLoginPopup, setOpenLoginPopup] = useState(false)

    const handleLoginPopup = () => {
        setOpenLoginPopup((toggleOpen) => !toggleOpen)
    }

    // Check if the click event occurs outside the popup.
    const handleClickOutsideLoginPopup = useCallback((event: Event) => {
        // Cast event.target to Element to use the closest method.
        const targetElement = event.target as Element;

        if (openLoginPopup && !targetElement.closest('.login-popup')) {
            setOpenLoginPopup(false)
        }
    }, [openLoginPopup])

    useEffect(() => {
        // 检查是否在浏览器环境中
        if (typeof window === 'undefined') return;
        
        // Add a global click event to track clicks outside the popup.
        document.addEventListener('click', handleClickOutsideLoginPopup);

        // Cleanup to avoid memory leaks.
        return () => {
            document.removeEventListener('click', handleClickOutsideLoginPopup);
        };
    }, [handleClickOutsideLoginPopup, openLoginPopup])

    return {
        openLoginPopup,
        handleLoginPopup,
    }
}

export default useLoginPopup