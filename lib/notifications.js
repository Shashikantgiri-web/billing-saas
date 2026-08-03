export function notificationLabel(action, metadata = {}) {
  const labels = {
    "invoice.created": `Invoice ${metadata.invoice_number || ""} created`,
    "invoice.deleted": `Invoice deleted`,
    "invoice.restored": `Invoice restored`,
    "invoice.void": `Invoice voided`,
    "customer.created": `New customer added`,
    "customer.updated": `Customer updated`,
    "customer.deleted": `Customer removed`,
    "product.created": `New product added`,
    "product.updated": `Product updated`,
    "product.deleted": `Product removed`,
    "settings.updated": `Business settings updated`,
    "business.status_changed": `Account status changed`,
  };
  return labels[action] || action;
}

export function notificationIcon(action) {
  if (action.startsWith("invoice")) return "FileText";
  if (action.startsWith("customer")) return "Users";
  if (action.startsWith("product")) return "Package";
  return "Bell";
}

export function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
