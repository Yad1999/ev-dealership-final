import { useState } from 'react';
import { X, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoanCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoanCalculatorModal({ isOpen, onClose }: LoanCalculatorModalProps) {
  const [vehiclePrice, setVehiclePrice] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [loanInterest, setLoanInterest] = useState('');
  const [loanDuration, setLoanDuration] = useState('');
  const [resultText, setResultText] = useState<string | null>(null);

  const calculateLoan = (e: React.FormEvent) => {
    e.preventDefault();

    const Vprice = parseFloat(vehiclePrice) || 0;
    const Dpayment = parseFloat(downPayment) || 0;
    const interest = parseFloat(loanInterest) || 0;
    const loanDurationNum = parseFloat(loanDuration) || 0;

    if (loanDurationNum <= 0) {
      setResultText("Please enter a valid loan duration.");
      return;
    }

    const principal = Vprice - Dpayment;
    if (principal <= 0) {
      setResultText("Down payment cannot equal or exceed vehicle price.");
      return;
    }

    const interestRate = (interest / 100) / 12;

    let result = 0;
    if (interestRate === 0) {
      result = principal / loanDurationNum;
    } else {
      result = principal * (interestRate) * Math.pow(1 + interestRate, loanDurationNum) / (Math.pow(1 + interestRate, loanDurationNum) - 1);
    }

    setResultText(`Your monthly interest payment is $${result.toFixed(2)} for ${loanDurationNum} months.`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#040A11]/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.1 }}
            className="relative w-full max-w-md bg-[#0B151F] border border-[#212A33] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden z-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full text-[#8F9AA4] hover:text-[#F6F9FC] hover:bg-[#14202D] transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#68E371]/10 border border-[#68E371]/20 flex items-center justify-center text-[#68E371]">
                  <Calculator className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-display font-bold text-[#F6F9FC]">
                  Loan Calculator
                </h2>
              </div>
              <p className="text-[#8F9AA4] text-sm">
                Please enter the fields to calculate your loan payments
              </p>
            </div>

            {/* Form */}
            <form onSubmit={calculateLoan} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#8F9AA4] mb-1.5">
                  Please enter the price of the vehicle
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="Enter here"
                  value={vehiclePrice}
                  onChange={(e) => setVehiclePrice(e.target.value)}
                  className="w-full bg-[#14202D] border border-[#212A33] text-[#F6F9FC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#68E371] transition-colors placeholder-[#455566]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8F9AA4] mb-1.5">
                  Please enter the amount you put as Down Payment
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="Enter here"
                  value={downPayment}
                  onChange={(e) => setDownPayment(e.target.value)}
                  className="w-full bg-[#14202D] border border-[#212A33] text-[#F6F9FC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#68E371] transition-colors placeholder-[#455566]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8F9AA4] mb-1.5">
                  Please enter your Loan Interest
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="Enter here"
                  value={loanInterest}
                  onChange={(e) => setLoanInterest(e.target.value)}
                  className="w-full bg-[#14202D] border border-[#212A33] text-[#F6F9FC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#68E371] transition-colors placeholder-[#455566]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8F9AA4] mb-1.5">
                  Please enter the duration of your loan (in months)
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="Enter here"
                  value={loanDuration}
                  onChange={(e) => setLoanDuration(e.target.value)}
                  className="w-full bg-[#14202D] border border-[#212A33] text-[#F6F9FC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#68E371] transition-colors placeholder-[#455566]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#68E371] hover:bg-[#52c95b] text-[#050C13] font-bold py-3.5 rounded-xl transition-all duration-200 shadow-[0_0_20px_rgba(104,227,113,0.15)] mt-2"
              >
                Calculate Loan Payment
              </button>
            </form>

            {/* Result Box */}
            <div className="mt-4 p-4 rounded-xl border border-[#212A33] bg-[#0A121A] text-center">
              <p className="text-sm font-semibold text-[#68E371]">
                {resultText || "Your monthly car payment is:"}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
