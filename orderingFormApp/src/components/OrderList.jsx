import React, { useState } from 'react';
import styles from '../styles/OrderList.module.css';
import logo from '../assets/logo.jpg'; 
import { jsPDF } from 'jspdf';

const OrderList = ({ orders, onDeleteOrder, onEditOrder }) => {
  const [deletingIds, setDeletingIds] = useState(new Set());

  const handleDeleteClick = (id) => {
    const newDeletingIds = new Set(deletingIds);
    newDeletingIds.add(id);
    setDeletingIds(newDeletingIds);
    setTimeout(() => {
      onDeleteOrder(id);
      const currentIds = new Set(deletingIds);
      currentIds.delete(id);
      setDeletingIds(currentIds);
    }, 500);
  };

  const getBase64ImageFromURL = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      };
      img.onerror = error => reject(error);
    });
  };

  const handleDownloadPDF = async (order) => {
    const doc = new jsPDF();

    // 1. Logo & Header
    try {
      const logoBase64 = await getBase64ImageFromURL(logo);
      doc.addImage(logoBase64, 'PNG', 90, 10, 30, 30); 
    } catch (error) { console.error("Logo error", error); }

    doc.setFontSize(22);
    doc.setTextColor(30, 91, 51); 
    doc.text("VyVy's Garden", 105, 50, { align: 'center' }); 
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text("Order Invoice", 105, 58, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 65, 190, 65);

    // 2. Customer Info
    doc.setFontSize(10);
    doc.setTextColor(0); 
    let yPos = 75;

    doc.text(`Order ID: ${order.id}`, 20, yPos);
    doc.text(`Date: ${new Date(order.id).toLocaleDateString()}`, 140, yPos);
    yPos += 7;
    doc.text(`Customer: ${order.customerName}`, 20, yPos);
    doc.text(`Contact: ${order.contactInfo}`, 140, yPos);
    yPos += 7;
    doc.text(`Payment: ${order.paymentMethod || 'Cash'}`, 20, yPos); // NEW
    doc.text(`Method: ${order.deliveryMethod}`, 140, yPos);

    if (order.deliveryMethod === 'Delivery') {
      yPos += 7;
      const addr = doc.splitTextToSize(`Addr: ${order.address}`, 100);
      doc.text(addr, 20, yPos);
      yPos += (5 * addr.length);
    }

    yPos += 10;

    // 3. ITEMS TABLE HEADER
    doc.setFillColor(240, 253, 244); 
    doc.rect(20, yPos, 170, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text("Item", 25, yPos + 7);
    doc.text("Price", 100, yPos + 7);
    doc.text("Qty", 130, yPos + 7);
    doc.text("Subtotal", 160, yPos + 7);
    
    yPos += 18;
    doc.setFont('helvetica', 'normal');

    // 4. ITEMS LOOP
    const items = order.items || [{ product: order.product, price: 0, quantity: order.quantity }];

    items.forEach(item => {
      doc.text(item.product, 25, yPos);
      doc.text(`P${item.price}`, 100, yPos);
      doc.text(String(item.quantity), 135, yPos); 
      doc.text(`P${item.price * item.quantity}`, 160, yPos);
      yPos += 8;
    });

    // Divider
    doc.line(20, yPos, 190, yPos);
    yPos += 10;

    // 5. TOTALS
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    const total = order.totalPrice || items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    doc.text(`Total Amount: P${total}`, 190, yPos, { align: 'right' });

    if (order.notes) {
      yPos += 15;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100);
      doc.text(`Note: ${order.notes}`, 20, yPos);
    }

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.setFont('helvetica', 'normal');
    doc.text("Thank you for supporting our small business!", 105, 280, { align: 'center' });

    doc.save(`Invoice_${order.customerName}.pdf`);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Saved Orders</h2>
      {orders.length === 0 ? (
        <p className={styles.noOrders}>No orders placed yet.</p>
      ) : (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
            <thead>
                <tr>
                <th className={styles.th}>Customer</th>
                <th className={styles.th}>Order Summary</th>
                <th className={styles.th}>Total</th>
                <th className={styles.th}>Action</th>
                </tr>
            </thead>
            <tbody>
                {orders.map((order) => {
                  // Compatibility check
                  const items = order.items || [{ product: order.product, quantity: order.quantity }];
                  const total = order.totalPrice || 0;

                  return (
                    <tr key={order.id} className={deletingIds.has(order.id) ? styles.deleting : ''}>
                        <td className={styles.td}>
                            <strong>{order.customerName}</strong><br/>
                            <small>{order.contactInfo}</small><br/>
                            <span style={{fontSize:'0.75rem', background:'#eee', padding:'2px 4px', borderRadius:'4px'}}>
                              {order.paymentMethod || 'Cash'}
                            </span>
                        </td>

                        <td className={styles.td}>
                            <ul style={{margin:0, paddingLeft:'1.2rem', fontSize:'0.9rem'}}>
                              {items.map((i, idx) => (
                                <li key={idx}>{i.quantity}x {i.product}</li>
                              ))}
                            </ul>
                            <div style={{marginTop:'0.25rem', fontSize:'0.85rem', color:'#1e5b33'}}>
                                {order.deliveryMethod} {order.deliveryMethod === 'Delivery' && '📍'}
                            </div>
                        </td>

                        <td className={styles.td}>
                           <strong>₱{total}</strong>
                        </td>

                        <td className={styles.td}>
                          <div className={styles.actionButtons}>
                            <button onClick={() => onEditOrder(order)} className={`${styles.textBtn} ${styles.editBtn}`}>Edit</button>
                            <button onClick={() => handleDownloadPDF(order)} className={`${styles.textBtn} ${styles.printBtn}`}>Invoice</button>
                            <button onClick={() => handleDeleteClick(order.id)} className={`${styles.textBtn} ${styles.deleteBtn}`}>Delete</button>
                          </div>
                        </td>
                    </tr>
                  );
                })}
            </tbody>
            </table>
        </div>
      )}
    </div>
  );
};

export default OrderList;