'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tradingFormSchema, TradingFormData } from '../../lib/validation';
import { TradingParameters, PositionType } from '../../domain/models/TradingPlan';
import Modal from '../../components/Modal';

interface TradingInputFormProps {
  onSubmit: (params: TradingParameters) => Promise<void>;
  isLoading?: boolean;
}

export default function TradingInputForm({ onSubmit, isLoading = false }: TradingInputFormProps) {
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'error' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'error'
  });

  // Store display values for currency fields to allow smooth typing
  const [displayValues, setDisplayValues] = useState<Partial<Record<keyof TradingFormData, string>>>({
    accountBalance: '',
    entryPrice: '',
    stopLoss: '',
    takeProfit: ''
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    watch,
  } = useForm<TradingFormData>({
    resolver: zodResolver(tradingFormSchema),
    defaultValues: {
      entryPrice: 0,
      stopLoss: 0,
      takeProfit: 0,
      accountBalance: 10000,
      riskPercentage: 2,
      leverage: 5,
      positionType: 'long',
      balance: 10000
    },
    mode: 'onBlur'
  });

  const watchedValues = watch();
  const isLong = watchedValues.takeProfit > watchedValues.entryPrice;

  const showModal = (title: string, message: string, type: 'error' | 'warning' | 'info' = 'error') => {
    setModal({
      isOpen: true,
      title,
      message,
      type
    });
  };

  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

  const formatCurrency = (value: number): string => {
    if (value === 0 || isNaN(value)) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const parseCurrency = (value: string): number => {
    const cleanValue = value.replace(/[$,]/g, '');
    return parseFloat(cleanValue) || 0;
  };

  const handleCurrencyChange = (field: keyof TradingFormData, value: string) => {
    // Update display value immediately for smooth typing
    setDisplayValues((prev) => ({
      ...prev,
      [field]: value
    }));

    // Parse and update form data
    const numValue = parseCurrency(value);
    setValue(field, numValue, { shouldValidate: false });
  };

  const handleCurrencyBlur = (field: keyof TradingFormData) => {
    // Format the value when user leaves the field
    const currentValue = getValues(field);

    // Only format currency fields, not positionType
    if (typeof currentValue === 'number') {
      const formattedValue = formatCurrency(currentValue);
      setDisplayValues((prev) => ({
        ...prev,
        [field]: formattedValue
      }));
    }

    // Trigger validation
    setValue(field, currentValue, { shouldValidate: true });
  };

  const handleCurrencyFocus = (field: keyof TradingFormData) => {
    // Show raw number when user focuses on the field
    const currentValue = getValues(field);

    // Only handle currency fields, not positionType
    if (typeof currentValue === 'number') {
      const rawValue = currentValue === 0 ? '' : currentValue.toString();
      setDisplayValues((prev) => ({
        ...prev,
        [field]: rawValue
      }));
    }
  };

  const onFormSubmit = async (data: TradingFormData) => {
    try {
      // Convert to TradingParameters format
      const tradingParams: TradingParameters = {
        entryPrice: data.entryPrice,
        stopLoss: data.stopLoss,
        takeProfit: data.takeProfit,
        leverage: data.leverage,
        positionType: data.positionType === 'long' ? PositionType.LONG : PositionType.SHORT,
        riskPercentage: data.riskPercentage,
        accountBalance: data.balance
      };

      await onSubmit(tradingParams);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Risk analysis failed';
      showModal('ANALYSIS ERROR', errorMessage, 'error');
    }
  };

  return (
    <div className="bg-white border border-gray-300 p-8">
      <h2 className="text-2xl font-black tracking-tight mb-8">
        TRADING <span className="text-gray-500">PARAMETERS</span>
      </h2>
      <div className="w-16 h-0.5 bg-black mb-8"></div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Balance */}
          <div>
            <label className="block text-sm font-black tracking-wide text-gray-700 mb-2">
              ACCOUNT BALANCE ($)
            </label>
            <input
              type="text"
              {...register('accountBalance', { valueAsNumber: true })}
              value={displayValues.accountBalance || ''}
              onChange={(e) => handleCurrencyChange('accountBalance', e.target.value)}
              onFocus={() => handleCurrencyFocus('accountBalance')}
              onBlur={() => handleCurrencyBlur('accountBalance')}
              className="w-full px-4 py-3 bg-white border border-gray-300 text-black rounded-none focus:outline-none focus:border-black transition-colors font-light"
              placeholder="$10,000.00"
            />
            {errors.accountBalance && (
              <p className="mt-2 text-sm text-red-600 font-light">{errors.accountBalance.message}</p>
            )}
          </div>

          {/* Leverage */}
          <div>
            <label className="block text-sm font-black tracking-wide text-gray-700 mb-2">
              LEVERAGE (x)
            </label>
            <input
              type="number"
              {...register('leverage', { valueAsNumber: true })}
              className="w-full px-4 py-3 bg-white border border-gray-300 text-black rounded-none focus:outline-none focus:border-black transition-colors font-light"
              placeholder="10"
            />
            {errors.leverage && (
              <p className="mt-2 text-sm text-red-600 font-light">{errors.leverage.message}</p>
            )}
          </div>

          {/* Entry Price */}
          <div>
            <label className="block text-sm font-black tracking-wide text-gray-700 mb-2">
              ENTRY PRICE ($)
            </label>
            <input
              type="text"
              {...register('entryPrice', { valueAsNumber: true })}
              value={displayValues.entryPrice || ''}
              onChange={(e) => handleCurrencyChange('entryPrice', e.target.value)}
              onFocus={() => handleCurrencyFocus('entryPrice')}
              onBlur={() => handleCurrencyBlur('entryPrice')}
              className="w-full px-4 py-3 bg-white border border-gray-300 text-black rounded-none focus:outline-none focus:border-black transition-colors font-light"
              placeholder="$50,000.00"
            />
            {errors.entryPrice && (
              <p className="mt-2 text-sm text-red-600 font-light">{errors.entryPrice.message}</p>
            )}
          </div>

          {/* Stop Loss */}
          <div>
            <label className="block text-sm font-black tracking-wide text-gray-700 mb-2">
              STOP LOSS ($)
              <span className="text-xs text-gray-500 ml-2 font-normal">
                {isLong ? '(BELOW ENTRY)' : '(ABOVE ENTRY)'}
              </span>
            </label>
            <input
              type="text"
              {...register('stopLoss', { valueAsNumber: true })}
              value={displayValues.stopLoss || ''}
              onChange={(e) => handleCurrencyChange('stopLoss', e.target.value)}
              onFocus={() => handleCurrencyFocus('stopLoss')}
              onBlur={() => handleCurrencyBlur('stopLoss')}
              className="w-full px-4 py-3 bg-white border border-gray-300 text-black rounded-none focus:outline-none focus:border-black transition-colors font-light"
              placeholder={isLong ? "$48,000.00" : "$52,000.00"}
            />
            {errors.stopLoss && (
              <p className="mt-2 text-sm text-red-600 font-light">{errors.stopLoss.message}</p>
            )}
          </div>

          {/* Take Profit */}
          <div>
            <label className="block text-sm font-black tracking-wide text-gray-700 mb-2">
              TAKE PROFIT ($)
              <span className="text-xs text-gray-500 ml-2 font-normal">
                {isLong ? '(ABOVE ENTRY)' : '(BELOW ENTRY)'}
              </span>
            </label>
            <input
              type="text"
              {...register('takeProfit', { valueAsNumber: true })}
              value={displayValues.takeProfit || ''}
              onChange={(e) => handleCurrencyChange('takeProfit', e.target.value)}
              onFocus={() => handleCurrencyFocus('takeProfit')}
              onBlur={() => handleCurrencyBlur('takeProfit')}
              className="w-full px-4 py-3 bg-white border border-gray-300 text-black rounded-none focus:outline-none focus:border-black transition-colors font-light"
              placeholder={isLong ? "$55,000.00" : "$45,000.00"}
            />
            {errors.takeProfit && (
              <p className="mt-2 text-sm text-red-600 font-light">{errors.takeProfit.message}</p>
            )}
          </div>

          {/* Risk Percentage */}
          <div>
            <label className="block text-sm font-black tracking-wide text-gray-700 mb-2">
              RISK PER TRADE (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="10"
              {...register('riskPercentage', { valueAsNumber: true })}
              className="w-full px-4 py-3 bg-white border border-gray-300 text-black rounded-none focus:outline-none focus:border-black transition-colors font-light"
              placeholder="1"
            />
            {errors.riskPercentage && (
              <p className="mt-2 text-sm text-red-600 font-light">{errors.riskPercentage.message}</p>
            )}
          </div>
        </div>

        {/* Position Type */}
        <div>
          <label className="block text-sm font-black tracking-wide text-gray-700 mb-2">
            POSITION TYPE
          </label>
          <select
            {...register('positionType')}
            className="w-full px-4 py-3 bg-white border border-gray-300 text-black rounded-none focus:outline-none focus:border-black transition-colors font-light"
          >
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>
          {errors.positionType && (
            <p className="mt-2 text-sm text-red-600 font-light">{errors.positionType.message}</p>
          )}
        </div>

        {/* Position Direction Indicator */}
        {watchedValues.entryPrice > 0 && watchedValues.takeProfit > 0 && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-300">
            <span className="text-sm font-black tracking-wide text-gray-700">
              POSITION TYPE:
            </span>
            <span className={`ml-3 px-3 py-1 text-xs font-black tracking-wider ${
              isLong 
                ? 'bg-green-100 text-green-800 border border-green-300' 
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}>
              {isLong ? 'LONG' : 'SHORT'}
            </span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-black text-white py-4 px-6 font-black tracking-wider hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
        >
          {isLoading ? 'ANALYZING...' : 'ANALYZE RISK'}
        </button>
      </form>

      {/* Custom Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  );
}
