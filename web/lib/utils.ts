import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Helper to clean up CSS class names (merges Tailwind classes effectively)
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// Helper to copy text to clipboard with a fallback for older browsers
export function copyToClipboard(text: string) {
    if (typeof window === 'undefined') return

    // Try modern Clipboard API first if available and secure
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).catch((err) => {
            console.error('Failed to copy: ', err)
            fallbackCopy(text)
        })
    } else {
        fallbackCopy(text)
    }
}

// Old school method: Create a hidden textarea, select it, and run "copy" command
function fallbackCopy(text: string) {
    try {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.left = '-9999px'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
    } catch (err) {
        console.error('Fallback copy failed: ', err)
    }
}
