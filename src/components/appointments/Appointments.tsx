import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Clock, User, MapPin, Phone, Edit3, Trash2, Shield } from 'lucide-react';
import { useHealthStore } from '../../store/healthStore';
import { useAuthStore } from '../../store/authStore';
import { Appointment } from '../../types';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface AppointmentForm {
  title: string;
  date: string;
  time: string;
  doctor: string;
  type: 'consultation' | 'checkup' | 'follow-up' | 'emergency';
  notes?: string;
}

const AppointmentCard: React.FC<{
  appointment: Appointment;
  onDelete: (id: string) => void;
  onEdit: (appointment: Appointment) => void;
}> = ({ appointment, onDelete, onEdit }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'consultation': return 'bg-blue-100 text-blue-800';
      case 'follow-up': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-full p-3">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-bold text-gray-900">{appointment.title}</h3>
              <Shield className="w-4 h-4 text-green-500" title="Secured on Algorand blockchain" />
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(appointment.type)}`}>
                {appointment.type}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                {appointment.status}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                {appointment.doctor}
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(appointment.date).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {appointment.time}
              </div>
            </div>
            {appointment.notes && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{appointment.notes}</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(appointment)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(appointment.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export const Appointments: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const { user } = useAuthStore();
  const { 
    appointments, 
    loadAppointments, 
    addAppointment, 
    updateAppointment, 
    removeAppointment,
    isLoading 
  } = useHealthStore();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<AppointmentForm>();

  // Load appointments when component mounts or user changes
  useEffect(() => {
    if (user?.id) {
      console.log('Loading appointments for user:', user.id);
      loadAppointments(user.id);
    }
  }, [user?.id, loadAppointments]);

  const onSubmit = async (data: AppointmentForm) => {
    if (!user?.id) {
      toast.error('Please sign in to add appointments');
      return;
    }

    try {
      console.log('Submitting appointment:', data);
      
      if (editingAppointment) {
        await updateAppointment(editingAppointment.id, {
          title: data.title,
          date: data.date,
          time: data.time,
          doctor: data.doctor,
          type: data.type,
          notes: data.notes,
          status: 'scheduled'
        });
        toast.success('Appointment updated successfully');
      } else {
        await addAppointment(user.id, {
          title: data.title,
          date: data.date,
          time: data.time,
          doctor: data.doctor,
          type: data.type,
          notes: data.notes,
          status: 'scheduled'
        });
        toast.success('Appointment scheduled successfully');
      }
      
      // Refresh the appointments list
      await loadAppointments(user.id);
      
      // Reset form and close
      reset();
      setShowAddForm(false);
      setEditingAppointment(null);
    } catch (error: any) {
      console.error('Error saving appointment:', error);
      toast.error(error.message || 'Failed to save appointment');
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setValue('title', appointment.title);
    setValue('date', appointment.date);
    setValue('time', appointment.time);
    setValue('doctor', appointment.doctor);
    setValue('type', appointment.type);
    setValue('notes', appointment.notes || '');
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await removeAppointment(id);
      toast.success('Appointment cancelled');
      
      // Refresh the appointments list
      if (user?.id) {
        await loadAppointments(user.id);
      }
    } catch (error: any) {
      console.error('Error cancelling appointment:', error);
      toast.error(error.message || 'Failed to cancel appointment');
    }
  };

  const handleCancel = () => {
    reset();
    setShowAddForm(false);
    setEditingAppointment(null);
  };

  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === 'scheduled' && new Date(apt.date) >= new Date()
  );

  const pastAppointments = appointments.filter(
    (apt) => apt.status === 'completed' || new Date(apt.date) < new Date()
  );

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
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-1">Manage your healthcare appointments and consultations</p>
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
          <span>Schedule Appointment</span>
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
              {editingAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Title *
                </label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., Annual Physical Exam"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doctor/Provider *
                </label>
                <input
                  {...register('doctor', { required: 'Doctor is required' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., Dr. Sarah Johnson"
                />
                {errors.doctor && (
                  <p className="mt-1 text-sm text-red-600">{errors.doctor.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  {...register('date', { required: 'Date is required' })}
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time *
                </label>
                <input
                  {...register('time', { required: 'Time is required' })}
                  type="time"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {errors.time && (
                  <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  {...register('type', { required: 'Type is required' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select type</option>
                  <option value="consultation">Consultation</option>
                  <option value="checkup">Regular Checkup</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="emergency">Emergency</option>
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Any additional notes or instructions"
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
                  {editingAppointment ? 'Update Appointment' : 'Schedule Appointment'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Appointments List */}
      <div className="space-y-8">
        {/* Upcoming Appointments */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Upcoming Appointments ({upcomingAppointments.length})
          </h2>
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-xl shadow-lg border border-gray-100">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No upcoming appointments.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
              >
                Schedule your first appointment
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {upcomingAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}
        </div>

        {/* Past Appointments */}
        {pastAppointments.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Past Appointments ({pastAppointments.length})
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pastAppointments.slice(0, 4).map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};