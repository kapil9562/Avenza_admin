const formatAddress = (address) => {
    if (!address) return;

    const format = [
        (address?.addressLine1?.charAt(0)?.toUpperCase() + address?.addressLine1?.slice(1)),
        address?.addressLine2,
        address?.city,
        address?.state,
        address?.country,
        address?.pinCode
    ].filter(Boolean).join(", ");
    return format;
}

const calSubtotal = (items) => {
    return items?.reduce((subtotal, item) => {
        return subtotal + (item?.price * item?.quantity);
    }, 0);
};

const normalizeGooglePhoto = (url) => {
    if (!url) return null;
    const base = url.split("=")[0];
    return `${base}=s200`;
};

const formatDate = (date) => {
    const d = new Date(date);

    const day = d.getDate();
    const month = d.toLocaleString("en-IN", { month: "short" });
    const year = d.getFullYear();

    return `${month} ${day}, ${year}`;
}

const formatTime = (time) => {
    return new Date(time).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

const formatStatus = (status) => {
    return status
        .replaceAll("_", " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
};

const statusColors = {
    processing: "text-yellow-600 bg-yellow-600/10 border border-yellow-400",
    shipped: "text-blue-600 bg-blue-600/10 border border-blue-400",
    out_for_delivery: "text-pink-600 bg-pink-600/10 border border-pink-400",
    delivered: "text-green-600 bg-green-600/10 border border-green-400",
    cancelled: "text-red-600 bg-red-600/10 border border-red-400",
};

const getPaymentBadge = (method) => {
    switch (method) {
        case "COD":
            return "bg-yellow-600/10 text-yellow-600 border border-yellow-400";
        case "Stripe":
            return "bg-teal-600/10 text-teal-600 border border-teal-400";
        case "Razorpay":
            return "bg-blue-600/10 text-blue-600 border border-blue-400";
        case "PayPal":
            return "bg-sky-600/10 text-sky-600 border border-sky-400";
        default:
            return "bg-gray-600/10 text-gray-600 border border-gray-400";
    }
};
const getActiveBadge = (method) => {
    switch (method) {
        case "true":
            return "bg-green-600/10 text-green-600 border border-green-400";
        default:
            return "bg-red-600/10 text-red-600 border border-red-400";
    }
};

export { formatAddress, calSubtotal, normalizeGooglePhoto, formatDate, formatTime, formatStatus, statusColors, getPaymentBadge, getActiveBadge };