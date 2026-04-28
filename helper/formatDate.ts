export const formatTime = (dateValue: any) => {
    if (!dateValue) return "N/A";
    const date = new Date(dateValue);
    return new Intl.DateTimeFormat("en-US", {
        // dateStyle: "medium",
        timeStyle: "short",
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
