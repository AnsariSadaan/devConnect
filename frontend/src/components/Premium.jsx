import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiCheck, 
  FiX, 
  FiUsers, 
  FiMessageCircle, 
  FiSearch, 
  FiStar, 
  FiEye,
  FiTrendingUp,
  FiZap,
  FiClock,
  FiUserCheck,
  FiInbox,
  FiMail,
  FiAward,
  FiGift
} from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { addUser } from '../utils/userSlice';
import api from '../utils/axios';

const Premium = () => {
  const [isUserPremium, setIsUserPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const dispatch = useDispatch();

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          setRazorpayLoaded(true);
          resolve(true);
        };
        script.onerror = () => {
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript();
  }, []);

  useEffect(() => {
    verifyPremiumUser();
  }, []);

  const verifyPremiumUser = async () => {
    try {
      const response = await api.get("/premium/verify", {
        withCredentials: true,
      });
      const userData = response.data;
      setIsUserPremium(userData.isPremium);

      // Update Redux store with latest user data
      if (userData) {
        dispatch(addUser(userData));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const paymentHandle = async (type) => {
    if (processingPayment) return;
    
    // Check if Razorpay is loaded
    if (!razorpayLoaded) {
      alert('Payment system is loading. Please try again in a moment.');
      return;
    }

    setProcessingPayment(true);
    try {
      const order = await api.post('/payment/create',
        { membershipType: type },
        { withCredentials: true }
      );

      const { amount, keyId, currency, notes, orderId } = order.data.data;
      
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'DevConnect',
        description: `Premium ${type.charAt(0).toUpperCase() + type.slice(1)} Membership`,
        order_id: orderId,
        prefill: {
          name: notes.firstName + " " + notes.lastName,
          email: notes.emailId,
          contact: '9999999999'
        },
        theme: {
          color: '#6366f1'
        },
        modal: {
          ondismiss: function() {
            setProcessingPayment(false);
          }
        },
        handler: async function(response) {
          try {
            await api.post("/payment/verify", response,
              {
                withCredentials: true,
              }
            );

            await verifyPremiumUser();
            setProcessingPayment(false);
            alert("Premium Activated Successfully");
          } catch (err) {
            console.error(err);
            alert("Payment verification failed");
            setProcessingPayment(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Something went wrong. Please try again.');
      setProcessingPayment(false);
    }
  };

  const plans = [
    {
      id: 'silver',
      name: 'Silver',
      price: '₹299',
      period: '/month',
      icon: FiStar,
      color: 'from-slate-400 to-slate-600',
      badge: 'Popular',
      features: [
        { text: 'Unlimited Chat Messages', included: true, icon: FiMessageCircle },
        { text: '200 Connection Requests/Day', included: true, icon: FiUserCheck },
        { text: 'Premium Profile Badge', included: true, icon: FiAward },
        { text: 'Full Chat History', included: true, icon: FiInbox },
        { text: 'Advanced Search Filters', included: false, icon: FiSearch },
        { text: 'Who Viewed Your Profile', included: false, icon: FiEye },
        { text: 'Priority Support', included: false, icon: FiMail },
      ]
    },
    {
      id: 'gold',
      name: 'Gold',
      price: '₹499',
      period: '/month',
      icon: FiGift,
      color: 'from-yellow-400 to-yellow-600',
      badge: 'Best Value',
      popular: true,
      features: [
        { text: 'Unlimited Chat Messages', included: true, icon: FiMessageCircle },
        { text: 'Unlimited Connection Requests', included: true, icon: FiUserCheck },
        { text: 'Premium Profile Badge', included: true, icon: FiAward },
        { text: 'Full Chat History', included: true, icon: FiInbox },
        { text: 'Advanced Search Filters', included: true, icon: FiSearch },
        { text: 'Who Viewed Your Profile', included: true, icon: FiEye },
        { text: 'Priority Support', included: true, icon: FiMail },
      ]
    }
  ];

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-base-content/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (isUserPremium) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="bg-success/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <FiAward className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-3xl font-bold mb-2">You're a Premium Member! 🎉</h2>
          <p className="text-base-content/60">
            Enjoy unlimited connections, messages, and all premium features.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3">Choose Your Plan</h1>
        <p className="text-base-content/60 max-w-2xl mx-auto">
          Upgrade to premium and unlock unlimited connections, messages, and exclusive features
        </p>
      </div>

      {/* Free Tier Info */}
      <div className="mb-10 bg-base-200 rounded-2xl p-6 border border-base-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-primary/10 p-2 rounded-lg">
            <FiUsers className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold text-lg">Free Tier</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <FiCheck className="w-4 h-4 text-success" />
            <span>10 Connection Requests per day</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FiCheck className="w-4 h-4 text-success" />
            <span>100 Messages per day</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FiX className="w-4 h-4 text-error" />
            <span>Basic Profile</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FiX className="w-4 h-4 text-error" />
            <span>Limited Chat History (30 days)</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FiX className="w-4 h-4 text-error" />
            <span>Basic Search</span>
          </div>
        </div>
      </div>

      {/* Premium Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan, index) => {
          const Icon = plan.icon;
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative card bg-base-100 shadow-xl border ${
                plan.popular ? 'border-primary shadow-primary/20' : 'border-base-200'
              } hover:shadow-2xl transition-shadow duration-200`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="badge badge-primary badge-lg gap-1">
                    <FiZap className="w-3 h-3" />
                    {plan.badge}
                  </span>
                </div>
              )}
              
              <div className="card-body">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${plan.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold">{plan.name}</h2>
                </div>

                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-base-content/60">{plan.period}</span>
                  {plan.popular && (
                    <div className="badge badge-success badge-sm ml-2">Save 40%</div>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => {
                    const FeatureIcon = feature.icon;
                    return (
                      <li key={idx} className="flex items-start gap-3 text-sm">
                        {feature.included ? (
                          <FiCheck className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                        ) : (
                          <FiX className="w-5 h-5 text-base-content/30 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={`flex items-center gap-2 ${feature.included ? '' : 'opacity-50'}`}>
                          <FeatureIcon className="w-4 h-4" />
                          {feature.text}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <button
                  onClick={() => paymentHandle(plan.id)}
                  className={`btn w-full ${
                    plan.popular ? 'btn-primary' : 'btn-outline'
                  } gap-2`}
                  disabled={!razorpayLoaded || processingPayment}
                >
                  {processingPayment ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Processing...
                    </>
                  ) : !razorpayLoaded ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Loading Payment...
                    </>
                  ) : (
                    <>
                      <FiZap className="w-4 h-4" />
                      Upgrade to {plan.name}
                    </>
                  )}
                </button>

                {plan.popular && (
                  <p className="text-xs text-center text-base-content/40 mt-2">
                    Includes all Silver features + more
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Trust Indicators */}
      <div className="mt-12 text-center">
        <div className="flex flex-wrap justify-center gap-6 text-sm text-base-content/60">
          <span className="flex items-center gap-2">
            <FiZap className="w-4 h-4 text-primary" />
            Instant access
          </span>
          <span className="flex items-center gap-2">
            <FiTrendingUp className="w-4 h-4 text-primary" />
            No hidden fees
          </span>
          <span className="flex items-center gap-2">
            <FiClock className="w-4 h-4 text-primary" />
            Cancel anytime
          </span>
        </div>
      </div>
    </div>
  );
};

export default Premium;