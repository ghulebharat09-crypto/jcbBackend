export const generateBookingNumber = (): string => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100 + Math.random() * 900); // 3 digit
  return `JCB-${year}-${randomNum}`;
};

export const generateInvoiceNumber = (): string => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 digit
  return `INV-${year}-${randomNum}`;
};
