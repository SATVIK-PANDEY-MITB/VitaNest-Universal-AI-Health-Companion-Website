import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Receipt, 
  Download, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  Loader,
  CreditCard,
  FileText
} from 'lucide-react';
import { StripeService } from '../../services/stripeService';
import { useAuthStore } from '../../store/authStore';

interface PaymentRecord {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  description: string;
  invoice_pdf?: string;
  receipt_url?: string;
}

export const PaymentHistory: React.FC = () => {
  const { user } = useAuthStore();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPaymentHistory();
  }, [user]);

  const loadPaymentHistory = async () => {
    if (!user?.stripeCustomerId) {
      setIsLoading(false);
      return;
    }

    try {
      // In a real implementation, you would fetch payment history from Stripe
      // For now, we'll use mock data
      const mockPayments: PaymentRecord[] = [
        {
          id: 'pi_1234567890',
          amount: 999,
          currency: 'usd',
          status: 'succeeded',
          created: Date.now() / 1000 - 86400 * 30, // 30 days ago
          description: 'Premium Monthly Subscription',
          receipt_url: '#'
        },
        {
          id: 'pi_0987654321',
          amount: 999,
          currency: 'usd',
          status: 'succeeded',
          created: Date.now() / 1000 - 86400 * 60, // 60 days ago
          description: 'Premium Monthly Subscription',
          receipt_url: '#'
        }
      ];

      setPayments(mockPayments);
    } catch (error) {
      console.error('Failed to load payment history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Loader className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="animate-spin w-8 h-8 text-blue-500" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-lg p-2">
            <Receipt className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Payment History</h2>
            <p className="text-gray-600 text-sm">View and download your payment receipts</p>
          </div>
        </div>
      </div>

      {/* Payment List */}
      {payments.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <Receipt className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Payment History</h3>
          <p className="text-gray-600">Your payment history will appear here once you make your first payment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{payment.description}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(payment.created)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {formatAmount(payment.amount, payment.currency)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(payment.status)}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </div>

                  {payment.receipt_url && payment.status === 'succeeded' && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => window.open(payment.receipt_url, '_blank')}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Receipt"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          // In a real implementation, this would download the receipt
                          console.log('Download receipt for payment:', payment.id);
                        }}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Download Receipt"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Footer */}
      {payments.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Need help with a payment? <a href="#" className="text-blue-600 hover:underline">Contact Support</a>
          </p>
        </div>
      )}
    </motion.div>
  );
};