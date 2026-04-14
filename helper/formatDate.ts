export const formatTime = (dateValue: any) => {
    if (!dateValue) return "";
    const date = new Date(dateValue);
    return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).format(date);
};

export const formatDate = (dateValue: any) => {
    if (!dateValue) return "";
    const date = new Date(dateValue);
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(date);
};
