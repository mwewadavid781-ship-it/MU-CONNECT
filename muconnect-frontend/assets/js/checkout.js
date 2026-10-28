// Muconnect WhatsApp Order Dispatch System
// AHAK DEV × TEKARU

/**
 * Formats a cart selection and opens WhatsApp with a pre-filled order message.
 * @param {Object} vendor - { name, phone }
 * @param {Array} items - Array of { name, quantity, price }
 * @param {Object} buyerDetails - { name, deliveryLocation, paymentMethod }
 */
function sendWhatsAppOrder(vendor, items, buyerDetails) {
  if (!vendor.phone) {
    alert("Vendor phone number is not available.");
    return;
  }

  // Clean phone number (ensure country code without leading +)
  let phone = vendor.phone.replace(/[^0-9]/g, '');
  if (phone.startsWith('0')) {
    phone = '260' + phone.substring(1); // Standardize Zambia country code
  }

  // Calculate order totals
  let subtotal = 0;
  let itemLines = items.map(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    return `• ${item.quantity}x *${item.name}* - K${itemTotal.toFixed(2)}`;
  }).join('\n');

  // Disclosed platform service fee (e.g., K3.00)
  const serviceFee = 3.00;
  const grandTotal = subtotal + serviceFee;

  // Build formatted message
  const message = 
`⚡ *NEW MUCONNECT ORDER*
--------------------------------
*Store:* ${vendor.name}

*Order Items:*
${itemLines}

--------------------------------
*Subtotal:* K${subtotal.toFixed(2)}
*Service Fee:* K${serviceFee.toFixed(2)}
*Total Amount:* *K${grandTotal.toFixed(2)} ZMW*
--------------------------------

*Buyer Info:*
• *Name:* ${buyerDetails.name}
• *Delivery Location:* ${buyerDetails.deliveryLocation}
• *Payment Method:* ${buyerDetails.paymentMethod} (Airtel Money / MTN Mobile Money)

_Order placed via Muconnect Campus Marketplace_`;

  // Encode for URL and trigger WhatsApp link
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;

  window.open(whatsappUrl, '_blank');
}
