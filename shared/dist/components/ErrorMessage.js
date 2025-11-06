import React from 'react';
export const ErrorMessage = ({ error, onRetry, className = '' }) => {
    if (!error)
        return null;
    const errorMessage = typeof error === 'string' ? error : error.message;
    return (React.createElement("div", { className: `bg-red-50 border border-red-200 rounded-md p-4 ${className}` },
        React.createElement("div", { className: "flex" },
            React.createElement("div", { className: "flex-shrink-0" },
                React.createElement("svg", { className: "h-5 w-5 text-red-400", viewBox: "0 0 20 20", fill: "currentColor" },
                    React.createElement("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }))),
            React.createElement("div", { className: "ml-3" },
                React.createElement("h3", { className: "text-sm font-medium text-red-800" }, "\u041F\u0440\u043E\u0438\u0437\u043E\u0448\u043B\u0430 \u043E\u0448\u0438\u0431\u043A\u0430"),
                React.createElement("div", { className: "mt-2 text-sm text-red-700" },
                    React.createElement("p", null, errorMessage)),
                onRetry && (React.createElement("div", { className: "mt-4" },
                    React.createElement("button", { onClick: onRetry, className: "bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500" }, "\u041F\u043E\u043F\u0440\u043E\u0431\u043E\u0432\u0430\u0442\u044C \u0441\u043D\u043E\u0432\u0430")))))));
};
