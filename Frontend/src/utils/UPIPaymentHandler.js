/**
 * Utility for handling UPI Payment redierctions and QR code link generation
 */

export const generateUPILink = (payment) => {
  const payeeUPI = payment.payee_upi_id || '';
  const payeeName = payment.payee_details?.user_details?.username || 'AgriChain_Participant';
  const amount = parseFloat(payment.amount).toFixed(2);
  const batchId = payment.batch_details?.product_batch_id || payment.batch;
  const paymentId = payment.id;

  // Format: upi://pay?pa=<receiver_upi>&pn=<name>&am=<amount>&cu=INR&tn=<transaction_note>
  return `upi://pay?pa=${payeeUPI}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${batchId}_${paymentId}`;
};

export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};
