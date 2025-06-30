import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pill, Clock, AlertCircle, Trash2, Edit3, Shield } from 'lucide-react';
import { useHealthStore } from '../../store/healthStore';
import { useAuthStore } from '../../store/authStore';
import { Medication } from '../../types';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface MedicationForm {
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  instructions?: string;
}

const MedicationCard: React.FC<{
  medication: Medication;
  onDelete: (id: string) => void;
  onEdit: (medication: Medication) => void;
}> = ({ medication, onDelete, onEdit }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9 }}
    whileHover={{ y: -2 }}
    className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200"
  >
    <div className="flex items-start justify-between">
      <div className="flex items-start space-x-4">
        <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-full p-3">
          <Pill className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-bold text-gray-900">{medication.name}</h3>
            <Shield className="w-4 h-4 text-green-500" title="Secured on Algorand blockchain" />
          </div>
          <p className="text-sm text-gray-600 mb-2">{medication.dosage}</p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {medication.frequency}
            </div>
            <div>
              Started: {new Date(medication.startDate).toLocaleDateString()}
            </div>
          </div>

          {medication.instructions && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
                <p className="text-sm text-blue-800">{medication.instructions}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onEdit(medication)}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Edit3 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(medication.id)}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  </motion.div>
);

export const Medications: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const { user } = useAuthStore();
  const { 
    medications, 
    loadMedications, 
    addMedication, 
    updateMedication, 
    removeMedication,
    isLoading 
  } = useHealthStore();
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<MedicationForm>();

  // Load medications when component mounts or user changes
  useEffect(() => {
    if (user?.id) {
      console.log('Loading medications for user:', user.id);
      loadMedications(user.id);
    }
  }, [user?.id, loadMedications]);

  const onSubmit = async (data: MedicationForm) => {
    if (!user?.id) {
      toast.error('Please sign in to add medications');
      return;
    }

    try {
      console.log('Submitting medication:', data);
      
      if (editingMedication) {
        await updateMedication(editingMedication.id, {
          name: data.name,
          dosage: data.dosage,
          frequency: data.frequency,
          startDate: data.startDate,
          endDate: data.endDate,
          instructions: data.instructions
        });
        toast.success('Medication updated successfully');
      } else {
        await addMedication(user.id, {
          name: data.name,
          dosage: data.dosage,
          frequency: data.frequency,
          startDate: data.startDate,
          endDate: data.endDate,
          instructions: data.instructions
        });
        toast.success('Medication added and secured on blockchain');
      }
      
      // Refresh the medications list
      await loadMedications(user.id);
      
      // Reset form and close
      reset();
      setShowAddForm(false);
      setEditingMedication(null);
    } catch (error: any) {
      console.error('Error saving medication:', error);
      toast.error(error.message || 'Failed to save medication');
    }
  };

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication);
    setValue('name', medication.name);
    setValue('dosage', medication.dosage);
    setValue('frequency', medication.frequency);
    setValue('startDate', medication.startDate);
    setValue('endDate', medication.endDate || '');
    setValue('instructions', medication.instructions || '');
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medication?')) {
      return;
    }

    try {
      await removeMedication(id);
      toast.success('Medication removed');
      
      // Refresh the medications list
      if (user?.id) {
        await loadMedications(user.id);
      }
    } catch (error: any) {
      console.error('Error removing medication:', error);
      toast.error(error.message || 'Failed to remove medication');
    }
  };

  const handleCancel = () => {
    reset();
    setShowAddForm(false);
    setEditingMedication(null);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medications</h1>
          <p className="text-gray-600 mt-1">Manage your medication schedule and reminders</p>
          <div className="flex items-center space-x-2 mt-2">
            <Shield className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-600">Secured on Algorand blockchain</span>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Medication</span>
        </motion.button>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingMedication ? 'Edit Medication' : 'Add New Medication'}
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medication Name *
                </label>
                <input
                  {...register('name', { required: 'Medication name is required' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., Aspirin"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dosage *
                </label>
                <input
                  {...register('dosage', { required: 'Dosage is required' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., 100mg"
                />
                {errors.dosage && (
                  <p className="mt-1 text-sm text-red-600">{errors.dosage.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency *
                </label>
                <select
                  {...register('frequency', { required: 'Frequency is required' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select frequency</option>
                  <option value="Once daily">Once daily</option>
                  <option value="Twice daily">Twice daily</option>
                  <option value="Three times daily">Three times daily</option>
                  <option value="Four times daily">Four times daily</option>
                  <option value="As needed">As needed</option>
                  <option value="Weekly">Weekly</option>
                </select>
                {errors.frequency && (
                  <p className="mt-1 text-sm text-red-600">{errors.frequency.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  {...register('startDate', { required: 'Start date is required' })}
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date (Optional)
                </label>
                <input
                  {...register('endDate')}
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions
                </label>
                <textarea
                  {...register('instructions')}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., Take with food, avoid alcohol"
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                >
                  {editingMedication ? 'Update Medication' : 'Add Medication'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Medications List */}
      <div className="space-y-4">
        {medications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-100"
          >
            <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
              <Pill className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No medications added yet</h3>
            <p className="text-gray-600 mb-4">Start by adding your first medication to track your health routine.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-green-600 transition-all duration-200"
            >
              Add Your First Medication
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence>
              {medications.map((medication) => (
                <MedicationCard
                  key={medication.id}
                  medication={medication}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};