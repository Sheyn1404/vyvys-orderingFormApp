import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import OrderForm from './components/OrderForm';
import OrderList from './components/OrderList';
import './App.css';

function App() {
  const [orders, setOrders] = useState([]);
  
  const [editingOrder, setEditingOrder] = useState(null);

  useEffect(() => {
    const savedOrders = localStorage.getItem('handicraftOrders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('handicraftOrders', JSON.stringify(orders));
  }, [orders]);

  // Create
  const addOrder = (newOrder) => {
    setOrders([...orders, newOrder]);
  };

  // Update
  const updateOrder = (updatedOrder) => {
    setOrders(orders.map(order => 
      order.id === updatedOrder.id ? updatedOrder : order
    ));
    setEditingOrder(null);
  };

  // Delete
  const deleteOrder = (id) => {
    setOrders(orders.filter(order => order.id !== id));
    if (editingOrder && editingOrder.id === id) {
      setEditingOrder(null);
    }
  };

  // Trigger Edit Mode
  const startEditing = (order) => {
    setEditingOrder(order);
  };

  // Cancel Edit Mode
  const cancelEditing = () => {
    setEditingOrder(null);
  }

  return (
    <div className="app-container">
      <Header />
      
      <div className="content-wrapper">
        <div className="form-section">
          <OrderForm 
            onAddOrder={addOrder} 
            onUpdateOrder={updateOrder} 
            editingOrder={editingOrder} 
            onCancelEdit={cancelEditing}
          />
        </div>

        <div className="list-section">
          <OrderList 
            orders={orders} 
            onDeleteOrder={deleteOrder} 
            onEditOrder={startEditing} 
          />
        </div>
      </div>
    </div>
  );
}

export default App;