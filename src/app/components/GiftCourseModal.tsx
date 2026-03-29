'use client';

import { useState } from 'react';
import { 
  X,
  Gift,
  User,
  Mail,
  MessageSquare,
  CheckCircle,
  Calendar,
  Clock
} from 'lucide-react';

interface GiftCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: {
    id: string;
    title: string;
    thumbnail: string;
    price: number;
    currency: string;
    instructor: string;
  };
}

export default function GiftCourseModal({ isOpen, onClose, course }: GiftCourseModalProps) {
  const [step, setStep] = useState<'recipient' | 'message' | 'confirm' | 'success'>('recipient');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('now');
  const [scheduledDate, setScheduledDate] = useState('');

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 'recipient') setStep('message');
    else if (step === 'message') setStep('confirm');
    else if (step === 'confirm') {
      // Process gift
      setStep('success');
    }
  };

  const handleBack = () => {
    if (step === 'message') setStep('recipient');
    else if (step === 'confirm') setStep('message');
  };

  const handleClose = () => {
    setStep('recipient');
    setRecipientEmail('');
    setRecipientName('');
    setGiftMessage('');
    setDeliveryDate('now');
    setScheduledDate('');
    onClose();
  };

  const quickMessages = [
    'Happy learning! I thought you\'d enjoy this course.',
    'This reminded me of your interest in indigenous arts!',
    'A gift for your continued growth and learning.',
    'Can\'t wait to hear what you learn from this!',
  ];

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6">
      <div className="bg-[#141414] rounded-2xl border border-[#d4af37]/30 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-[#d4af37]/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#d4af37]/20 rounded-lg flex items-center justify-center">
                <Gift size={20} className="text-[#d4af37]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Gift This Course</h3>
                <p className="text-gray-400 text-sm">Share knowledge with someone special</p>
              </div>
            </div>
            <button 
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Success View */}
        {step === 'success' ? (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Gift Sent!</h3>
            <p className="text-gray-400 mb-6">
              {deliveryDate === 'now' 
                ? `${recipientName || 'Your recipient'} will receive an email with their gift shortly.`
                : `Your gift is scheduled to be delivered on ${scheduledDate}.`
              }
            </p>
            <div className="bg-[#0a0a0a] rounded-lg p-4 mb-6 text-left">
              <p className="text-gray-400 text-sm mb-1">Gift Details</p>
              <p className="text-white font-medium">{course.title}</p>
              <p className="text-[#d4af37]">{course.price} {course.currency}</p>
            </div>
            <button 
              onClick={handleClose}
              className="px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-medium rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Progress Steps */}
            <div className="px-6 py-4">
              <div className="flex items-center gap-2">
                {['recipient', 'message', 'confirm'].map((s, index) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step === s ? 'bg-[#d4af37] text-black' :
                      ['message', 'confirm'].includes(step) && index < ['recipient', 'message', 'confirm'].indexOf(step) 
                        ? 'bg-green-500/20 text-green-500' 
                        : 'bg-[#0a0a0a] text-gray-500'
                    }`}>
                      {['message', 'confirm'].includes(step) && index < ['recipient', 'message', 'confirm'].indexOf(step) ? (
                        <CheckCircle size={16} />
                      ) : (
                        index + 1
                      )}
                    </div>
                    {index < 2 && (
                      <div className={`w-12 h-0.5 ${
                        ['message', 'confirm'].includes(step) && index < ['recipient', 'message', 'confirm'].indexOf(step)
                          ? 'bg-green-500/50' 
                          : 'bg-[#0a0a0a]'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 pt-0">
              {/* Course Preview */}
              <div className="flex gap-4 p-4 bg-[#0a0a0a] rounded-lg mb-6">
                <img 
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-24 h-16 object-cover rounded-lg"
                />
                <div>
                  <p className="text-white font-medium line-clamp-2">{course.title}</p>
                  <p className="text-gray-400 text-sm">by {course.instructor}</p>
                  <p className="text-[#d4af37] font-medium">{course.price} {course.currency}</p>
                </div>
              </div>

              {/* Step 1: Recipient Info */}
              {step === 'recipient' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Recipient Email *</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="email"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder="friend@example.com"
                        className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Recipient Name</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="Their name (optional)"
                        className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Delivery</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 bg-[#0a0a0a] rounded-lg cursor-pointer border border-[#d4af37]/20 hover:border-[#d4af37]/50 transition-colors">
                        <input
                          type="radio"
                          name="delivery"
                          value="now"
                          checked={deliveryDate === 'now'}
                          onChange={(e) => setDeliveryDate(e.target.value)}
                          className="text-[#d4af37]"
                        />
                        <Clock size={18} className="text-gray-400" />
                        <span className="text-white">Send immediately</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 bg-[#0a0a0a] rounded-lg cursor-pointer border border-[#d4af37]/20 hover:border-[#d4af37]/50 transition-colors">
                        <input
                          type="radio"
                          name="delivery"
                          value="scheduled"
                          checked={deliveryDate === 'scheduled'}
                          onChange={(e) => setDeliveryDate(e.target.value)}
                          className="text-[#d4af37]"
                        />
                        <Calendar size={18} className="text-gray-400" />
                        <span className="text-white">Schedule for later</span>
                      </label>
                    </div>
                  </div>

                  {deliveryDate === 'scheduled' && (
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  )}
                </div>
              )}

              {/* Step 2: Gift Message */}
              {step === 'message' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Personal Message</label>
                    <textarea
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      placeholder="Write a personal message to accompany your gift..."
                      rows={4}
                      className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Quick Messages</label>
                    <div className="space-y-2">
                      {quickMessages.map((msg, index) => (
                        <button
                          key={index}
                          onClick={() => setGiftMessage(msg)}
                          className="w-full p-3 bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg text-left text-gray-300 text-sm hover:border-[#d4af37]/50 transition-colors"
                        >
                          {msg}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Confirm */}
              {step === 'confirm' && (
                <div className="space-y-4">
                  <div className="p-4 bg-[#0a0a0a] rounded-lg">
                    <h4 className="text-white font-medium mb-3">Gift Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">To:</span>
                        <span className="text-white">{recipientEmail}</span>
                      </div>
                      {recipientName && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Name:</span>
                          <span className="text-white">{recipientName}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-400">Course:</span>
                        <span className="text-white">{course.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Amount:</span>
                        <span className="text-[#d4af37]">{course.price} {course.currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Delivery:</span>
                        <span className="text-white">
                          {deliveryDate === 'now' ? 'Immediately' : scheduledDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {giftMessage && (
                    <div className="p-4 bg-[#0a0a0a] rounded-lg">
                      <h4 className="text-white font-medium mb-2">Your Message</h4>
                      <p className="text-gray-300 text-sm italic">&ldquo;{giftMessage}&rdquo;</p>
                    </div>
                  )}

                  <div className="p-4 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-lg">
                    <p className="text-[#d4af37] text-sm">
                      The recipient will receive an email with instructions to access their gifted course.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-[#d4af37]/20 flex justify-between">
              {step !== 'recipient' ? (
                <button 
                  onClick={handleBack}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Back
                </button>
              ) : (
                <div />
              )}
              <button 
                onClick={handleNext}
                disabled={
                  (step === 'recipient' && !recipientEmail) ||
                  (step === 'confirm' && deliveryDate === 'scheduled' && !scheduledDate)
                }
                className="px-6 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-medium rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {step === 'confirm' ? 'Complete Purchase' : 'Continue'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
