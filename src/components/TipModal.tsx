import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  HeartHandshake,
  CreditCard,
  X,
  Check,
  Sparkles,
  Coffee,
  Zap,
  Rocket,
  Crown,
  Copy,
  ExternalLink,
  ShieldCheck,
  Heart
} from 'lucide-react';
import { Video, User, Tip } from '../types';
import { sendTip, getTipsForVideo } from '../lib/storage';

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: Video;
  currentUser: User;
  onTipSent?: (tip: Tip) => void;
}

const PRESET_AMOUNTS = [
  { amount: 2, label: 'Espresso', icon: Coffee, desc: 'Quick boost' },
  { amount: 5, label: 'Power-Up', icon: Zap, desc: 'Fan favorite' },
  { amount: 10, label: 'Super Thanks', icon: Rocket, desc: 'Highlight message' },
  { amount: 25, label: 'Producer Tier', icon: Crown, desc: 'Gold supporter badge' },
];

export const TipModal: React.FC<TipModalProps> = ({
  isOpen,
  onClose,
  video,
  currentUser,
  onTipSent,
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(5);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('Thank you for this incredible video!');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'cashapp' | 'crypto'>('card');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successTip, setSuccessTip] = useState<Tip | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const existingTips = getTipsForVideo(video.id);

  const currentAmount = isCustom ? (parseFloat(customAmount) || 0) : selectedAmount;

  const handleSelectPreset = (amount: number) => {
    setSelectedAmount(amount);
    setIsCustom(false);
  };

  const handleCustomChange = (val: string) => {
    setCustomAmount(val);
    setIsCustom(true);
  };

  const handleSendTip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentAmount <= 0) return;

    setIsSubmitting(true);
    // Simulate real gateway processing
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newTip = sendTip({
      videoId: video.id,
      videoTitle: video.title,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      recipientId: video.uploader_id,
      recipientName: video.uploader_name,
      amount: currentAmount,
      currency: 'USD',
      message: message.trim() || undefined,
      paymentMethod,
    });

    setIsSubmitting(false);
    setSuccessTip(newTip);
    if (onTipSent) onTipSent(newTip);
  };

  const handleCopyLink = () => {
    const tipUrl = `${window.location.origin}/?v=${video.id}#tip`;
    navigator.clipboard.writeText(tipUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-neutral-800 bg-neutral-950/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <HeartHandshake className="w-5 h-5 text-neutral-950 font-bold" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Send Money & Super Thanks
                </h3>
                <p className="text-xs text-neutral-400 truncate max-w-xs">
                  Direct support to <span className="text-amber-400 font-semibold">{video.uploader_name}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success Screen */}
          {successTip ? (
            <div className="p-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-white">Payment Sent Successfully!</h4>
                <p className="text-xs text-neutral-300 max-w-sm mx-auto leading-relaxed">
                  You sent <span className="text-emerald-400 font-bold text-sm">${successTip.amount}.00 USD</span> to{' '}
                  <span className="text-white font-semibold">{video.uploader_name}</span>. Your support message has been highlighted!
                </p>
              </div>

              {successTip.message && (
                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200 text-left">
                  <div className="flex items-center gap-2 font-semibold text-amber-300 mb-1">
                    <Heart className="w-3.5 h-3.5 fill-current" /> Supporter Note:
                  </div>
                  <p className="italic">"{successTip.message}"</p>
                </div>
              )}

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setSuccessTip(null);
                    onClose();
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all"
                >
                  Return to Video
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSendTip} className="p-6 space-y-5">
              {/* Creator Card */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                <div className="flex items-center gap-3">
                  <img
                    src={video.uploader_avatar}
                    alt={video.uploader_name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-500/40"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      {video.uploader_name}
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      {(video.uploader_subscribers || 14200).toLocaleString()} subscribers
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                    Zero Fees
                  </span>
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% to creator
                  </span>
                </div>
              </div>

              {/* Amount Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
                  Select Tip Amount
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_AMOUNTS.map((preset) => {
                    const Icon = preset.icon;
                    const isSelected = !isCustom && selectedAmount === preset.amount;
                    return (
                      <button
                        key={preset.amount}
                        type="button"
                        onClick={() => handleSelectPreset(preset.amount)}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 text-amber-300 ring-1 ring-amber-500/40'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-900'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-neutral-400'}`} />
                          <span className="text-xs font-bold">${preset.amount}</span>
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold text-white truncate">{preset.label}</div>
                          <div className="text-[9px] text-neutral-500">{preset.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Amount */}
                <div className="pt-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500 text-sm">
                      $
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      step="1"
                      placeholder="Or enter custom amount in USD"
                      value={customAmount}
                      onChange={(e) => handleCustomChange(e.target.value)}
                      className={`w-full pl-7 pr-4 py-2 bg-neutral-950 border rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors ${
                        isCustom ? 'border-amber-500 ring-1 ring-amber-500/50' : 'border-neutral-800'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Supporter Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
                  Supporter Note (Optional)
                </label>
                <textarea
                  rows={2}
                  maxLength={200}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Say something nice or ask a question..."
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors resize-none"
                />
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { id: 'card', label: 'Credit Card', icon: CreditCard },
                    { id: 'paypal', label: 'PayPal', icon: DollarSign },
                    { id: 'cashapp', label: 'Cash App', icon: HeartHandshake },
                    { id: 'crypto', label: 'Crypto (USDC)', icon: Sparkles },
                  ].map((method) => {
                    const Icon = method.icon;
                    const isSelected = paymentMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`p-2.5 rounded-lg border text-center transition-all flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-medium">{method.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || currentAmount <= 0}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">Processing Payment...</span>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4 stroke-[2.5]" />
                    <span>Send ${currentAmount > 0 ? currentAmount : 0}.00 USD to {video.uploader_name}</span>
                  </>
                )}
              </button>

              {/* Recent Supporters */}
              {existingTips.length > 0 && (
                <div className="pt-2 border-t border-neutral-800/80 space-y-2">
                  <span className="text-[11px] font-semibold text-neutral-400 block">
                    Recent Supporters on this video ({existingTips.length})
                  </span>
                  <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                    {existingTips.slice(0, 3).map((tip) => (
                      <div
                        key={tip.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-neutral-950/80 border border-neutral-800 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={tip.senderAvatar}
                            alt={tip.senderName}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="font-medium text-neutral-200 truncate">{tip.senderName}</span>
                          {tip.message && (
                            <span className="text-[10px] text-neutral-500 truncate max-w-[140px]">
                              - "{tip.message}"
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-amber-400 font-mono text-[11px] shrink-0">
                          +${tip.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-neutral-800 bg-neutral-950/80 text-xs">
            <button
              onClick={handleCopyLink}
              className="text-neutral-400 hover:text-white flex items-center gap-1.5 text-[11px] transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLink ? 'Tip link copied' : 'Copy creator tip link'}
            </button>
            <span className="text-[11px] text-neutral-500">
              Encrypted SSL &bull; Direct Settlement
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
