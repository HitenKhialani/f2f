import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  RefreshCcw,
  Globe,
  Plus
} from 'lucide-react';
import { farmerAPI, batchAPI, stakeholderAPI, transportAPI, paymentAPI } from '../../services/api';
import { assistantTranslations } from './AssistantTranslations';

const AssistantWidget = ({ onActionComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState('en');
  const [messages, setMessages] = useState([]);
  const [options, setOptions] = useState([]);
  const [currentFlow, setCurrentFlow] = useState('MENU');
  const [flowStep, setFlowStep] = useState('INIT');
  const [flowData, setFlowData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customInputValue, setCustomInputValue] = useState('');

  const messagesEndRef = useRef(null);
  const translations = assistantTranslations[lang];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, options]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      resetConversation();
    }
  }, [isOpen]);

  const addMessage = (text, sender = 'bot') => {
    setMessages(prev => [...prev, { text, sender, id: Date.now() + Math.random() }]);
  };

  const setBotState = (text, opts) => {
    addMessage(text, 'bot');
    setOptions(opts || []);
  };

  const resetConversation = () => {
    setMessages([]);
    setCurrentFlow('MENU');
    setFlowStep('INIT');
    setFlowData({});
    setBotState(translations.greeting, [
      { label: translations.options_menu.create_batch, value: 'CREATE_BATCH' },
      { label: translations.options_menu.view_batches, value: 'VIEW_BATCHES' },
      { label: translations.options_menu.edit_batch, value: 'EDIT_BATCH' },
      { label: translations.options_menu.product_description, value: 'PRODUCT_DESCRIPTION' },
      { label: translations.options_menu.request_transport, value: 'REQUEST_TRANSPORT' },
      { label: translations.options_menu.track_batch, value: 'TRACK_BATCH' },
      { label: translations.options_menu.verify_batch, value: 'VERIFY_BATCH' },
      { label: translations.options_menu.view_inspection, value: 'VIEW_INSPECTION' },
      { label: translations.options_menu.suspend_batch, value: 'SUSPEND_BATCH' },
      { label: translations.options_menu.batch_recommendations, value: 'BATCH_RECOMMENDATIONS' },
      { label: translations.options_menu.payment_status, value: 'PAYMENT_STATUS' },
      { label: translations.options_menu.crop_preferences, value: 'CROP_PREFERENCES' }
    ]);
  };

  const handleOptionSelect = (option) => {
    const { label, value } = option;
    addMessage(label, 'user');
    setOptions([]);
    processUserInput(value, label);
  };

  const processUserInput = async (value, rawLabel) => {
    if (currentFlow === 'MENU') {
      handleMenuSelection(value);
      return;
    }
    if (currentFlow === 'CREATE_BATCH') {
      await handleCreateBatchFlow(value, rawLabel);
      return;
    }
    if (currentFlow === 'REQUEST_TRANSPORT') {
      await handleTransportFlow(value, rawLabel);
      return;
    }
    if (currentFlow === 'EDIT_BATCH') {
      await handleEditBatchFlow(value, rawLabel);
      return;
    }
    if (currentFlow === 'TRACK_BATCH') {
      await handleTrackBatchFlow(value, rawLabel);
      return;
    }
    if (currentFlow === 'VERIFY_BATCH') {
      await handleVerifyBatchFlow(value, rawLabel);
      return;
    }
    if (currentFlow === 'PRODUCT_DESCRIPTION') {
      await handleProductDescriptionFlow(value, rawLabel);
      return;
    }
    if (currentFlow === 'VIEW_INSPECTION') {
      await handleViewInspectionFlow(value, rawLabel);
      return;
    }
    if (currentFlow === 'SUSPEND_BATCH') {
      await handleSuspendBatchFlow(value, rawLabel);
      return;
    }
    addMessage(translations.common.not_understood, 'bot');
    resetConversation();
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customInputValue.trim()) return;
    const val = customInputValue.trim();
    addMessage(val, 'user');
    setShowCustomInput(false);
    setCustomInputValue('');
    setOptions([]);
    processUserInput(val, val);
  };

  const handleMenuSelection = async (selection) => {
    if (selection === 'CREATE_BATCH') {
      setCurrentFlow('CREATE_BATCH');
      setFlowStep('CROP');
      setIsLoading(true);
      addMessage(translations.common.fetching_data, 'bot');
      try {
        const res = await farmerAPI.getAllCrops();
        const crops = res.data;
        const cropOpts = crops.map(c => ({ label: c, value: c }));
        setBotState(translations.create_batch.ask_crop, cropOpts);
      } catch (e) {
        setBotState(translations.create_batch.error, []);
        resetConversation();
      } finally {
        setIsLoading(false);
      }
      return;
    }
    if (selection === 'REQUEST_TRANSPORT') {
      setCurrentFlow('REQUEST_TRANSPORT');
      setFlowStep('BATCH');
      setIsLoading(true);
      try {
        const res = await batchAPI.list();
        const eligibleBatches = res.data.filter(b => !b.is_child_batch && !b.is_locked);
        if (eligibleBatches.length === 0) {
          setBotState("You have no eligible batches for transport right now.", []);
          resetConversation();
          return;
        }
        const bOpts = eligibleBatches.map(b => ({
          label: `${b.product_batch_id} (${b.crop_type})`,
          value: b.id
        }));
        setBotState(translations.request_transport.ask_batch, bOpts);
      } catch (e) {
        setBotState(translations.request_transport.error, []);
        resetConversation();
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (selection === 'VIEW_BATCHES') {
      setIsLoading(true);
      try {
        const res = await batchAPI.list();
        const active = res.data.filter(b => b.status !== 'SUSPENDED');
        setBotState(`You have ${active.length} active batches. Check the main dashboard for details.`, []);
      } catch (e) {
        addMessage("Failed to fetch batches.", 'bot');
      } finally {
        setIsLoading(false);
        setTimeout(resetConversation, 3000);
      }
      return;
    }
    if (selection === 'PAYMENT_STATUS') {
      setIsLoading(true);
      try {
        const res = await paymentAPI.getSummary();
        const pending = res.data.pending_count || 0;
        const revenue = res.data.total_revenue || 0;
        setBotState(`You have ${pending} pending payments. Total revenue is ₹${revenue}.`, []);
      } catch (e) {
        addMessage("Failed to fetch payment status.", 'bot');
      } finally {
        setIsLoading(false);
        setTimeout(resetConversation, 4000);
      }
      return;
    }

    if (selection === 'EDIT_BATCH') {
      setCurrentFlow('EDIT_BATCH');
      setFlowStep('SELECT_BATCH');
      setIsLoading(true);
      try {
        const res = await batchAPI.list();
        const editableBatches = res.data.filter(b => !b.is_locked && b.status !== 'SUSPENDED');
        if (editableBatches.length === 0) {
          setBotState("No editable batches available.", []);
          resetConversation();
          return;
        }
        const bOpts = editableBatches.map(b => ({
          label: `${b.product_batch_id} (${b.crop_type}, ${b.quantity}kg)`,
          value: b.id,
          batch: b
        }));
        setBotState("Select a batch to edit:", bOpts);
      } catch (e) {
        setBotState("Failed to fetch batches.", []);
        resetConversation();
      } finally {
        setIsLoading(false);
      }
      return;
    }
    if (selection === 'TRACK_BATCH') {
      setCurrentFlow('TRACK_BATCH');
      setFlowStep('SELECT_BATCH');
      setIsLoading(true);
      try {
        const res = await batchAPI.list();
        if (res.data.length === 0) {
          setBotState("You have no batches to track.", []);
          resetConversation();
          return;
        }
        const bOpts = res.data.map(b => ({
          label: `${b.product_batch_id} (${b.crop_type}) - ${b.status}`,
          value: b.id,
          batch: b
        }));
        setBotState("Select a batch to track:", bOpts);
      } catch (e) {
        setBotState("Failed to fetch batches.", []);
        resetConversation();
      } finally {
        setIsLoading(false);
      }
      return;
    }
    if (selection === 'VERIFY_BATCH') {
      setCurrentFlow('VERIFY_BATCH');
      setFlowStep('SELECT_BATCH');
      setIsLoading(true);
      try {
        const res = await batchAPI.list();
        if (res.data.length === 0) {
          setBotState("You have no batches to verify.", []);
          resetConversation();
          return;
        }
        const bOpts = res.data.map(b => ({
          label: `${b.product_batch_id} (${b.crop_type})`,
          value: b.product_batch_id,
          batch: b
        }));
        setBotState("Select a batch to verify blockchain status:", bOpts);
      } catch (e) {
        setBotState("Failed to fetch batches.", []);
        resetConversation();
      } finally {
        setIsLoading(false);
      }
      return;
    }
    if (selection === 'PRODUCT_DESCRIPTION') {
      setCurrentFlow('PRODUCT_DESCRIPTION');
      setFlowStep('SELECT_BATCH');
      setIsLoading(true);
      try {
        const res = await batchAPI.list();
        const eligibleBatches = res.data.filter(b => 
          b.status !== 'SUSPENDED' && b.status !== 'SOLD'
        );
        if (eligibleBatches.length === 0) {
          setBotState("You have no eligible batches for product description.", []);
          resetConversation();
          return;
        }
        const bOpts = eligibleBatches.map(b => ({
          label: `${b.product_batch_id} (${b.crop_type})`,
          value: b.id,
          batch: b
        }));
        setBotState("Select a batch to add product description:", bOpts);
      } catch (e) {
        setBotState("Failed to fetch batches.", []);
        resetConversation();
      } finally {
        setIsLoading(false);
      }
      return;
    }
    if (selection === 'VIEW_INSPECTION') {
      setCurrentFlow('VIEW_INSPECTION');
      setFlowStep('SELECT_BATCH');
      setIsLoading(true);
      try {
        const res = await batchAPI.list();
        if (res.data.length === 0) {
          setBotState("You have no batches to view inspections.", []);
          resetConversation();
          return;
        }
        const bOpts = res.data.map(b => ({
          label: `${b.product_batch_id} (${b.crop_type})`,
          value: b.id,
          batch: b
        }));
        setBotState("Select a batch to view inspection history:", bOpts);
      } catch (e) {
        setBotState("Failed to fetch batches.", []);
        resetConversation();
      } finally {
        setIsLoading(false);
      }
      return;
    }
    if (selection === 'SUSPEND_BATCH') {
      setCurrentFlow('SUSPEND_BATCH');
      setFlowStep('SELECT_BATCH');
      setIsLoading(true);
      try {
        const res = await batchAPI.list();
        const suspendableBatches = res.data.filter(b => 
          ['CREATED', 'TRANSPORT_REQUESTED', 'TRANSPORT_REJECTED'].includes(b.status)
        );
        if (suspendableBatches.length === 0) {
          setBotState("You have no batches that can be suspended.", []);
          resetConversation();
          return;
        }
        const bOpts = suspendableBatches.map(b => ({
          label: `${b.product_batch_id} (${b.crop_type}) - ${b.status}`,
          value: b.id,
          batch: b
        }));
        setBotState("Select a batch to suspend:", bOpts);
      } catch (e) {
        setBotState("Failed to fetch batches.", []);
        resetConversation();
      } finally {
        setIsLoading(false);
      }
      return;
    }
    if (selection === 'BATCH_RECOMMENDATIONS') {
      setIsLoading(true);
      try {
        const res = await farmerAPI.getBatchRecommendations();
        if (res.data.length === 0) {
          setBotState("No batch recommendations available at the moment.", []);
        } else {
          const recText = res.data.map((rec, i) => 
            `${i+1}. ${rec.crop_type} - ${rec.quantity || 'N/A'}kg - ₹${rec.farmer_base_price_per_unit || 'N/A'}/kg`
          ).join('\n');
          setBotState(`Here are your batch recommendations:\n\n${recText}`, []);
        }
      } catch (e) {
        setBotState("Failed to fetch recommendations.", []);
      } finally {
        setIsLoading(false);
      }
      return;
    }
    if (selection === 'CROP_PREFERENCES') {
      setIsLoading(true);
      try {
        const res = await farmerAPI.getCrops();
        if (res.data.length === 0) {
          setBotState("You have no crop preferences set. Select crops during registration to set preferences.", []);
        } else {
          const cropText = res.data.join(', ');
          setBotState(`Your crop preferences: ${cropText}`, []);
        }
      } catch (e) {
        setBotState("Failed to fetch crop preferences.", []);
      } finally {
        setIsLoading(false);
      }
      return;
    }
    addMessage(translations.common.not_understood, 'bot');
    resetConversation();
  };

  const handleCreateBatchFlow = async (value, rawLabel) => {
    switch (flowStep) {
      case 'CROP':
        setFlowData({ ...flowData, crop_type: value });
        setFlowStep('QUANTITY');
        setBotState(translations.create_batch.ask_quantity, [
          { label: '50 kg', value: '50' },
          { label: '100 kg', value: '100' },
          { label: '500 kg', value: '500' },
          { label: '1000 kg', value: '1000' }
        ]);
        break;
      
      case 'QUANTITY':
        // Ensure numbers only
        const qty = value.toString().replace(/[^0-9]/g, '');
        if (!qty) {
          setBotState(translations.common.not_understood, [
            { label: '50 kg', value: '50' },
            { label: '100 kg', value: '100' }
          ]);
          return;
        }
        setFlowData({ ...flowData, quantity: qty });
        setFlowStep('DATE');
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        setBotState(translations.create_batch.ask_date, [
          { label: 'Today', value: today },
          { label: 'Yesterday', value: yesterday }
        ]);
        break;

      case 'DATE':
        let selectedDate = value;
        if (value.toLowerCase() === 'today') {
          selectedDate = new Date().toISOString().split('T')[0];
        } else if (value.toLowerCase() === 'yesterday') {
          selectedDate = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        }
        if (isNaN(new Date(selectedDate).getTime())) {
          selectedDate = new Date().toISOString().split('T')[0];
        }
        setFlowData({ ...flowData, harvest_date: selectedDate });
        setFlowStep('PRICE');
        setBotState(translations.create_batch.ask_price, [
          { label: '₹20 / kg', value: '20' },
          { label: '₹40 / kg', value: '40' },
          { label: '₹60 / kg', value: '60' },
          { label: '₹100 / kg', value: '100' }
        ]);
        break;
      
      case 'PRICE':
        const price = value.toString().replace(/[^0-9]/g, '');
        if (!price) {
          setBotState(translations.common.not_understood, [
             { label: '₹40 / kg', value: '40' }
          ]);
          return;
        }
        const newData = { ...flowData, farmer_base_price_per_unit: price };
        setFlowData(newData);
        setFlowStep('CONFIRM');
        const summary = `${translations.create_batch.confirm}\n- Crop: ${newData.crop_type}\n- Qty: ${newData.quantity} kg\n- Price: ₹${newData.farmer_base_price_per_unit}/kg`;
        setBotState(summary, [
          { label: translations.common.confirm, value: 'YES' },
          { label: translations.common.cancel, value: 'NO' }
        ]);
        break;

      case 'CONFIRM':
        if (value === 'YES' || value.toLowerCase() === 'yes') {
          setIsLoading(true);
          try {
            await batchAPI.create(flowData);
            setBotState(translations.create_batch.success, []);
            if (onActionComplete) onActionComplete();
          } catch (e) {
            setBotState(translations.create_batch.error, []);
          } finally {
            setIsLoading(false);
            setTimeout(resetConversation, 3000);
          }
        } else {
          resetConversation();
        }
        break;
      
      default:
        resetConversation();
    }
  };

  const handleTransportFlow = async (value, rawLabel) => {
    switch (flowStep) {
      case 'BATCH':
        setFlowData({ ...flowData, batch_id: value });
        setFlowStep('DISTRIBUTOR');
        setIsLoading(true);
        try {
          const res = await stakeholderAPI.listProfiles();
          const dists = res.data.filter(p => p.role === 'distributor');
          if (dists.length === 0) {
            setBotState("No distributors available.", []);
            resetConversation();
            return;
          }
          const dOpts = dists.map(d => ({
            label: d.organization || d.user_details?.username || `Distributor ${d.id}`,
            value: d.id
          }));
          setBotState(translations.request_transport.ask_distributor, dOpts);
        } catch (e) {
           setBotState(translations.request_transport.error, []);
           resetConversation();
        } finally {
          setIsLoading(false);
        }
        break;
      
      case 'DISTRIBUTOR':
        setFlowData({ ...flowData, distributor_id: value });
        setFlowStep('CONFIRM');
        setBotState(`Confirm transport request to Distributor?`, [
          { label: translations.common.confirm, value: 'YES' },
          { label: translations.common.cancel, value: 'NO' }
        ]);
        break;

      case 'CONFIRM':
        if (value === 'YES' || value.toLowerCase() === 'yes') {
          setIsLoading(true);
          try {
            await transportAPI.createRequest(flowData);
            setBotState(translations.request_transport.success, []);
            if (onActionComplete) onActionComplete();
          } catch (e) {
            setBotState(translations.request_transport.error, []);
          } finally {
            setIsLoading(false);
            setTimeout(resetConversation, 3000);
          }
        } else {
          resetConversation();
        }
        break;
    }
  }

  const handleEditBatchFlow = async (value, rawLabel) => {
    switch (flowStep) {
      case 'SELECT_BATCH':
        const selectedBatch = options.find(o => o.value === value)?.batch;
        if (!selectedBatch) {
          setBotState("Invalid selection. Please try again.", []);
          resetConversation();
          return;
        }
        setFlowData({ batch: selectedBatch });
        setFlowStep('SELECT_FIELD');
        setBotState("What would you like to edit?", [
          { label: `Quantity (current: ${selectedBatch.quantity} kg)`, value: 'quantity' },
          { label: `Base Price (current: ₹${selectedBatch.farmer_base_price_per_unit})`, value: 'farmer_base_price_per_unit' },
          { label: `Harvest Date (current: ${selectedBatch.harvest_date || 'N/A'})`, value: 'harvest_date' }
        ]);
        break;

      case 'SELECT_FIELD':
        setFlowData({ ...flowData, field: value });
        setFlowStep('ENTER_VALUE');
        const fieldLabels = {
          quantity: 'Enter new quantity (kg):',
          farmer_base_price_per_unit: 'Enter new base price per unit (₹):',
          harvest_date: 'Enter new harvest date:'
        };
        setBotState(fieldLabels[value] || 'Enter new value:', []);
        break;

      case 'ENTER_VALUE':
        const { batch, field } = flowData;
        const fields = {};
        if (field === 'quantity') {
          fields.quantity = value.replace(/[^0-9]/g, '');
        } else if (field === 'farmer_base_price_per_unit') {
          fields.farmer_base_price_per_unit = value.replace(/[^0-9.]/g, '');
        } else if (field === 'harvest_date') {
          fields.harvest_date = value;
        }
        setIsLoading(true);
        try {
          const { blockchainAPI } = await import('../../services/api');
          await blockchainAPI.editBatch(batch.product_batch_id, fields, 'Farmer edit via assistant');
          setBotState("Batch updated successfully!", []);
          if (onActionComplete) onActionComplete();
        } catch (e) {
          setBotState("Failed to update batch. Please try again.", []);
        } finally {
          setIsLoading(false);
          setTimeout(resetConversation, 3000);
        }
        break;
    }
  }

  const handleTrackBatchFlow = async (value, rawLabel) => {
    const selectedBatch = options.find(o => o.value === value)?.batch;
    if (!selectedBatch) {
      setBotState("Invalid selection. Please try again.", []);
      resetConversation();
      return;
    }

    setIsLoading(true);
    try {
      const statusMessages = {
        'HARVESTED': '🌾 Batch harvested and registered',
        'STORED': '📦 Batch stored at farm',
        'IN_TRANSPORT': '🚚 In transport to distributor',
        'AT_DISTRIBUTOR': '🏭 At distributor facility',
        'IN_TRANSIT_TO_RETAILER': '🚛 In transit to retailer',
        'AT_RETAILER': '🏪 At retailer store',
        'SOLD': '✅ Sold to consumer'
      };
      const statusMsg = statusMessages[selectedBatch.status] || `Status: ${selectedBatch.status}`;
      const location = selectedBatch.current_location || selectedBatch.farm_location || 'Unknown';
      let trackingInfo = `${statusMsg}\n\n`;
      trackingInfo += `📍 Current Location: ${location}\n`;
      trackingInfo += `📦 Quantity: ${selectedBatch.quantity} kg\n`;
      trackingInfo += `🌾 Crop: ${selectedBatch.crop_type}\n`;
      if (selectedBatch.current_owner) {
        trackingInfo += `👤 Current Owner: ${selectedBatch.current_owner}`;
      }
      setBotState(trackingInfo, []);
    } catch (e) {
      setBotState("Failed to fetch tracking info.", []);
    } finally {
      setIsLoading(false);
      setTimeout(resetConversation, 5000);
    }
  }

  const handleVerifyBatchFlow = async (value, rawLabel) => {
    const batchId = value;
    
    setIsLoading(true);
    try {
      const { blockchainAPI } = await import('../../services/api');
      const res = await blockchainAPI.verifyBatch(batchId);
      const data = res.data;
      
      let verifyMsg = '';
      if (data.verified) {
        verifyMsg = '✅ Blockchain Verified Successfully!\n\n';
        verifyMsg += `🔗 Anchored on: ${new Date(data.blockchain_timestamp).toLocaleString()}\n`;
        verifyMsg += `👤 Farmer: ${data.farmer}\n`;
        verifyMsg += `📦 Batch: ${data.batch_id}`;
      } else if (data.tampered) {
        verifyMsg = '⚠️ Data Integrity Failed!\n\n';
        if (data.tampered_fields && data.tampered_fields.length > 0) {
          verifyMsg += 'Modified fields detected:\n';
          data.tampered_fields.forEach(field => {
            verifyMsg += `- ${field.field}: ${field.old_value} → ${field.new_value}\n`;
            verifyMsg += `  By: ${field.modified_by} (${field.modified_role})\n`;
          });
        } else {
          verifyMsg += '⚠️ ' + (data.message || 'Verification failed but no edit logs found.');
        }
      } else {
        verifyMsg = '⏳ Verification Pending\n\n';
        verifyMsg += 'Your batch is awaiting blockchain confirmation.';
      }
      
      setBotState(verifyMsg, []);
    } catch (e) {
      setBotState("Failed to verify batch. Please try again.", []);
    } finally {
      setIsLoading(false);
      setTimeout(resetConversation, 5000);
    }
  }

  const handleProductDescriptionFlow = async (value, rawLabel) => {
    const batchId = value;
    const batch = rawLabel.batch;
    
    setIsLoading(true);
    try {
      const { inspectionAPI } = await import('../../services/api');
      const res = await inspectionAPI.getBatchTimeline(batchId);
      const inspections = res.data;
      const hasDescription = inspections.some(i => i.stage === 'farmer');
      
      let msg = '';
      if (hasDescription) {
        msg = `✅ Product description already exists for batch ${batch.product_batch_id}.\n\n`;
        msg += `Crop: ${batch.crop_type}\n`;
        msg += `Quantity: ${batch.quantity}kg\n`;
        msg += `Status: ${batch.status}`;
      } else {
        msg = `📝 Product Description Needed\n\n`;
        msg += `Batch: ${batch.product_batch_id}\n`;
        msg += `Crop: ${batch.crop_type}\n`;
        msg += `Quantity: ${batch.quantity}kg\n\n`;
        msg += 'Please add product description and photos from the batch management page.';
      }
      
      setBotState(msg, []);
    } catch (e) {
      setBotState("Failed to check product description status.", []);
    } finally {
      setIsLoading(false);
      setTimeout(resetConversation, 5000);
    }
  }

  const handleViewInspectionFlow = async (value, rawLabel) => {
    const batchId = value;
    const batch = rawLabel.batch;
    
    setIsLoading(true);
    try {
      const { inspectionAPI } = await import('../../services/api');
      const res = await inspectionAPI.getBatchTimeline(batchId);
      const inspections = res.data;
      
      let msg = `🔍 Inspection History for ${batch.product_batch_id}\n\n`;
      
      if (inspections.length === 0) {
        msg += 'No inspections recorded yet.';
      } else {
        inspections.forEach((inspection, i) => {
          msg += `${i+1}. ${inspection.stage.toUpperCase()}\n`;
          msg += `   Status: ${inspection.result}\n`;
          msg += `   By: ${inspection.created_by}\n`;
          msg += `   Date: ${new Date(inspection.created_at).toLocaleDateString()}\n`;
          if (inspection.inspection_notes) {
            msg += `   Notes: ${inspection.inspection_notes}\n`;
          }
          msg += '\n';
        });
      }
      
      setBotState(msg, []);
    } catch (e) {
      setBotState("Failed to fetch inspection history.", []);
    } finally {
      setIsLoading(false);
      setTimeout(resetConversation, 5000);
    }
  }

  const handleSuspendBatchFlow = async (value, rawLabel) => {
    const batchId = value;
    const batch = rawLabel.batch;
    
    setIsLoading(true);
    try {
      // For suspension, we need to provide a reason
      setBotState(`⚠️ Suspend Batch: ${batch.product_batch_id}\n\n` +
        `Crop: ${batch.crop_type}\n` +
        `Quantity: ${batch.quantity}kg\n` +
        `Current Status: ${batch.status}\n\n` +
        `Please go to the batch management page to suspend this batch with a reason.`, []);
    } catch (e) {
      setBotState("Failed to prepare suspension.", []);
    } finally {
      setIsLoading(false);
      setTimeout(resetConversation, 5000);
    }
  }

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 p-3 sm:p-4 bg-green-600 text-white rounded-full shadow-xl hover:bg-green-700 transition-all z-[100] flex items-center gap-2 group"
      >
        <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="hidden group-hover:block font-medium px-2 text-sm">Assistant</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-4 sm:right-4 md:bottom-6 md:right-6 w-full h-full sm:w-80 sm:h-[500px] md:w-96 md:h-[600px] sm:max-h-[80vh] bg-white dark:bg-cosmos-800 sm:rounded-2xl shadow-2xl border-0 sm:border border-gray-100 dark:border-cosmos-700 flex flex-col z-[100] overflow-hidden">
      
      {/* Header */}
      <div className="bg-green-600 text-white p-3 sm:p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
          <h3 className="font-semibold text-sm sm:text-base">AgriChain Assistant</h3>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={() => {
              const langs = ['en', 'hi', 'mr'];
              setLang(langs[(langs.indexOf(lang) + 1) % langs.length]);
            }}
            className="text-white/80 hover:text-white flex items-center gap-1 text-xs"
            title="Switch Language"
          >
            <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
            {lang.toUpperCase()}
          </button>
          <button onClick={resetConversation} className="text-white/80 hover:text-white" title="Restart">
            <RefreshCcw className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white ml-1 sm:ml-2">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50/50 dark:bg-cosmos-900/50 min-h-0">
        {messages.map((msg, i) => (
          <div key={msg.id || i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-3 py-2 sm:px-4 sm:py-2 text-sm ${
                msg.sender === 'user' 
                  ? 'bg-green-600 text-white rounded-br-none' 
                  : 'bg-white dark:bg-cosmos-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-cosmos-700 rounded-bl-none shadow-sm'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white dark:bg-cosmos-800 border border-gray-100 dark:border-cosmos-700 rounded-2xl rounded-bl-none px-4 py-2 animate-pulse">
               <div className="flex gap-1">
                 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
               </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Options Area - Always Visible When Available */}
      {options.length > 0 && (
        <div className="p-3 sm:p-4 bg-white dark:bg-cosmos-800 border-t border-gray-100 dark:border-cosmos-700 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 sm:max-h-56 overflow-y-auto">
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleOptionSelect(opt)}
                disabled={isLoading}
                className="px-3 py-2.5 text-sm font-medium bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 dark:hover:from-green-900/50 dark:hover:to-emerald-900/50 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transform hover:-translate-y-0.5 min-h-[44px] flex items-center justify-center text-center"
              >
                {opt.label}
              </button>
            ))}
          </div>
          {options.length > 4 && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              Scroll for more options ↑
            </div>
          )}
        </div>
      )}

      {/* Status Bar - Always show Plus button, conditionally show restart */}
      {!isLoading && (
        <div className="p-2 flex items-center gap-2 bg-gray-50 dark:bg-cosmos-800 border-t border-gray-100 dark:border-cosmos-700 shrink-0">
          <button 
            onClick={() => setShowCustomInput(true)}
            className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full hover:bg-emerald-200 transition-colors"
            title="Custom Input"
          >
            <Plus className="w-5 h-5" />
          </button>
          
          {options.length === 0 && (
            <div className="flex-1 text-center">
              <button 
                onClick={resetConversation}
                className="text-xs text-green-600 hover:text-green-700 font-medium"
              >
                Tap to restart conversation
              </button>
            </div>
          )}
        </div>
      )}

      {/* Custom Input Modal */}
      {showCustomInput && (
        <div className="absolute inset-x-0 bottom-0 bg-white dark:bg-cosmos-800 border-t border-gray-200 dark:border-cosmos-700 p-4 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-b-2xl animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Custom Input</h4>
            <button 
              onClick={() => setShowCustomInput(false)}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleCustomSubmit} className="flex gap-2">
            <input
              type="text"
              value={customInputValue}
              onChange={(e) => setCustomInputValue(e.target.value)}
              placeholder="Type your message..."
              autoFocus
              className="flex-1 px-4 py-2 border border-gray-200 dark:border-cosmos-700 rounded-xl bg-gray-50 dark:bg-cosmos-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={!customInputValue.trim()}
              className="px-4 py-2 bg-emerald-600 text-white font-medium text-sm rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default AssistantWidget;
