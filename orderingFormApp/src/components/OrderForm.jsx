import React, { useState, useEffect } from 'react';
import styles from '../styles/OrderForm.module.css';

const PRICES = {
  Rose: 100,
  Tulips: 80,
  Keychains: 50
};

const OrderForm = ({ onAddOrder, onUpdateOrder, editingOrder, onCancelEdit }) => {
  const initialFormState = {
    customerName: '',
    contactInfo: '',
    notes: '',
    deliveryMethod: 'Pickup',
    address: '',
    paymentMethod: 'Cash', 
    items: []
  };

  const [formData, setFormData] = useState(initialFormState);
  
  const [currentItem, setCurrentItem] = useState({ product: 'Rose', quantity: 1 });
  
  const [errors, setErrors] = useState({});
  const [flashMessage, setFlashMessage] = useState('');

  useEffect(() => {
    if (editingOrder) {
      const loadedItems = editingOrder.items || [{ 
        product: editingOrder.product, 
        quantity: editingOrder.quantity,
        price: PRICES[editingOrder.product] || 0
      }];
      
      setFormData({ ...editingOrder, items: loadedItems });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setFormData(initialFormState);
    }
  }, [editingOrder]);

  // Flash Message Timer
  useEffect(() => {
    if (flashMessage) {
      const timer = setTimeout(() => setFlashMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [flashMessage]);

  // --- CALCULATE TOTALS ---
  const calculateTotal = () => {
    return formData.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'contactInfo') {
       if (!/^\d*$/.test(value)) { setFlashMessage('Only numbers allowed!'); return; }
       if (value.length > 11) { setFlashMessage('Max 11 digits!'); return; }
       setFlashMessage('');
    }
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem({ ...currentItem, [name]: value });
  };

  // ADD ITEM TO CART
  const addItemToCart = () => {
    if (currentItem.quantity < 1) {
      setFlashMessage('Quantity must be at least 1');
      return;
    }

    const newItem = {
      ...currentItem,
      id: Date.now(), 
      price: PRICES[currentItem.product], 
      quantity: parseInt(currentItem.quantity)
    };

    setFormData({
      ...formData,
      items: [...formData.items, newItem]
    });

    setCurrentItem({ product: 'Rose', quantity: 1 });
    setFlashMessage('');
  };

  // REMOVE ITEM FROM CART
  const removeItem = (indexToRemove) => {
    const updatedItems = formData.items.filter((_, index) => index !== indexToRemove);
    setFormData({ ...formData, items: updatedItems });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.customerName.trim()) newErrors.customerName = 'Name is required';
    if (!formData.contactInfo.trim()) {
      newErrors.contactInfo = 'Contact info required';
    } else if (!/^09\d{9}$/.test(formData.contactInfo)) {
      newErrors.contactInfo = 'Must start with 09 (11 digits)';
    }
    
    // VALIDATE CART IS NOT EMPTY
    if (formData.items.length === 0) {
      setFlashMessage('Please add at least one item to the order!');
      return;
    }

    if (formData.deliveryMethod === 'Delivery' && !formData.address.trim()) {
        newErrors.address = 'Address required for delivery';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const orderData = {
      ...formData,
      totalPrice: calculateTotal(),
      address: formData.deliveryMethod === 'Pickup' ? '' : formData.address 
    };

    if (editingOrder) {
      onUpdateOrder({ ...orderData, id: editingOrder.id });
    } else {
      onAddOrder({ ...orderData, id: Date.now() });
    }

    setFormData(initialFormState);
    setErrors({});
    setFlashMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h3 style={{marginTop:0, color:'#1e5b33'}}>
        {editingOrder ? 'Edit Order' : 'New Order'}
      </h3>

      {/* 1. CUSTOMER DETAILS */}
      <div className={styles.section}>
        <div className={styles.row}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Customer Name</label>
            <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} className={styles.input} placeholder="Full Name" />
            {errors.customerName && <span className={styles.error}>{errors.customerName}</span>}
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Contact No.</label>
            <input type="text" name="contactInfo" value={formData.contactInfo} onChange={handleChange} className={styles.input} placeholder="09XXXXXXXXX" style={flashMessage ? {borderColor:'#dc3545'} : {}} />
            {flashMessage && <span className={`${styles.error} ${styles.flashFade}`}>⚠️ {flashMessage}</span>}
            {!flashMessage && errors.contactInfo && <span className={styles.error}>{errors.contactInfo}</span>}
          </div>
        </div>
      </div>

      <hr className={styles.divider} />

      {/* 2. ORDER BUILDER (Add Items) */}
      <div className={styles.section}>
        <label className={styles.label}>Build Your Order</label>
        <div className={styles.cartBuilder}>
          <div className={styles.inputGroup}>
            <select name="product" value={currentItem.product} onChange={handleItemChange} className={styles.select}>
              {Object.keys(PRICES).map(p => <option key={p} value={p}>{p} (₱{PRICES[p]})</option>)}
            </select>
          </div>
          <div className={styles.inputGroup} style={{maxWidth:'100px'}}>
            <input type="number" name="quantity" value={currentItem.quantity} onChange={handleItemChange} className={styles.input} min="1" />
          </div>
          <button type="button" onClick={addItemToCart} className={styles.addBtn}>Add +</button>
        </div>

        {/* CART LIST DISPLAY */}
        {formData.items.length > 0 ? (
          <div className={styles.cartList}>
            <table style={{width:'100%', fontSize:'0.9rem', borderCollapse:'collapse'}}>
              <thead>
                <tr style={{borderBottom:'1px solid #ddd', color:'#666'}}>
                  <th style={{textAlign:'left'}}>Item</th>
                  <th>Qty</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, index) => (
                  <tr key={index} style={{borderBottom:'1px solid #eee'}}>
                    <td style={{padding:'0.5rem 0'}}>{item.product}</td>
                    <td style={{textAlign:'center'}}>{item.quantity}</td>
                    <td style={{textAlign:'center'}}>₱{item.price * item.quantity}</td>
                    <td style={{textAlign:'right'}}>
                      <button type="button" onClick={() => removeItem(index)} className={styles.removeBtn}>×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className={styles.totalDisplay}>
              Total: ₱{calculateTotal()}
            </div>
          </div>
        ) : (
          <p style={{fontStyle:'italic', color:'#888', fontSize:'0.9rem'}}>No items added yet.</p>
        )}
      </div>

      <hr className={styles.divider} />

      {/* 3. PAYMENT & DELIVERY */}
      <div className={styles.section}>
         <div className={styles.inputGroup}>
            <label className={styles.label}>Payment Method</label>
            <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                    <input type="radio" name="paymentMethod" value="Cash" checked={formData.paymentMethod === 'Cash'} onChange={handleChange} /> Cash
                </label>
                <label className={styles.radioLabel}>
                    <input type="radio" name="paymentMethod" value="GCash" checked={formData.paymentMethod === 'GCash'} onChange={handleChange} /> GCash
                </label>
            </div>
        </div>

        {/* Delivery Method */}
        <div className={styles.inputGroup}>
            <label className={styles.label}>Delivery Method</label>
            <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                    <input type="radio" name="deliveryMethod" value="Pickup" checked={formData.deliveryMethod === 'Pickup'} onChange={handleChange} /> Pick-up
                </label>
                <label className={styles.radioLabel}>
                    <input type="radio" name="deliveryMethod" value="Delivery" checked={formData.deliveryMethod === 'Delivery'} onChange={handleChange} /> Delivery
                </label>
            </div>
        </div>

        {formData.deliveryMethod === 'Delivery' && (
            <div className={`${styles.inputGroup} ${styles.flashFade}`}>
              <label className={styles.label}>Delivery Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} className={styles.textarea} style={{minHeight: '60px'}} placeholder="Complete address" />
              {errors.address && <span className={styles.error}>{errors.address}</span>}
            </div>
        )}
        
        <div className={styles.inputGroup}>
          <label className={styles.label}>Notes</label>
          <textarea name="notes" value={formData.notes} onChange={handleChange} className={styles.textarea} placeholder="Special requests?" />
        </div>
      </div>

      {/* ACTIONS */}
      <div style={{display:'flex', gap:'1rem', marginTop:'1rem'}}>
        <button type="submit" className={styles.submitBtn} style={{flex:1}}>
          {editingOrder ? 'Update Order' : 'Submit Order'}
        </button>
        {editingOrder && (
          <button type="button" onClick={onCancelEdit} className={styles.submitBtn} style={{flex:1, backgroundColor: '#6c757d'}}>Cancel</button>
        )}
      </div>
    </form>
  );
};

export default OrderForm;