import Swal from 'sweetalert2';

// Pre-configured SweetAlert2 instance with app theming
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    }
});

export const alert = {
    // Success notification
    success: (title: string, text?: string) => {
        return Swal.fire({
            icon: 'success',
            title,
            text,
            confirmButtonText: 'OK'
        });
    },

    // Error notification
    error: (title: string, text?: string) => {
        return Swal.fire({
            icon: 'error',
            title,
            text,
            confirmButtonText: 'OK'
        });
    },

    // Warning notification
    warning: (title: string, text?: string) => {
        return Swal.fire({
            icon: 'warning',
            title,
            text,
            confirmButtonText: 'OK'
        });
    },

    // Info notification
    info: (title: string, text?: string) => {
        return Swal.fire({
            icon: 'info',
            title,
            text,
            confirmButtonText: 'OK'
        });
    },

    // Confirmation dialog
    confirm: async (options: {
        title: string;
        text?: string;
        confirmText?: string;
        cancelText?: string;
        icon?: 'warning' | 'question' | 'info';
        isDanger?: boolean;
    }) => {
        const result = await Swal.fire({
            title: options.title,
            text: options.text,
            icon: options.icon || 'question',
            showCancelButton: true,
            confirmButtonText: options.confirmText || 'Yes',
            cancelButtonText: options.cancelText || 'Cancel',
            confirmButtonColor: options.isDanger ? '#ef4444' : '#3b82f6',
            reverseButtons: true
        });
        return result.isConfirmed;
    },

    // Prompt for input
    prompt: async (options: {
        title: string;
        text?: string;
        inputPlaceholder?: string;
        inputValue?: string;
        inputType?: 'text' | 'email' | 'password' | 'number' | 'textarea';
        confirmText?: string;
    }) => {
        const result = await Swal.fire({
            title: options.title,
            text: options.text,
            input: options.inputType || 'text',
            inputPlaceholder: options.inputPlaceholder || '',
            inputValue: options.inputValue || '',
            showCancelButton: true,
            confirmButtonText: options.confirmText || 'Submit',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
            inputValidator: (value) => {
                if (!value) {
                    return 'Please enter a value';
                }
                return null;
            }
        });
        return result.isConfirmed ? result.value : null;
    },

    // Toast notifications (non-blocking)
    toast: {
        success: (title: string) => Toast.fire({ icon: 'success', title }),
        error: (title: string) => Toast.fire({ icon: 'error', title }),
        warning: (title: string) => Toast.fire({ icon: 'warning', title }),
        info: (title: string) => Toast.fire({ icon: 'info', title })
    },

    // Loading indicator
    loading: (title: string = 'Loading...') => {
        Swal.fire({
            title,
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    },

    // Close any open alert
    close: () => Swal.close()
};

// Export Swal for advanced use cases
export { Swal };
export { alert as alertService };
export default alert;
