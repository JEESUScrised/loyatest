import React, { useState } from 'react';
import { useCashier } from '../../hooks/useCashier';

interface CodeGeneratorProps {
  onCodeGenerated?: (code: string) => void;
}

const CodeGenerator: React.FC<CodeGeneratorProps> = ({ onCodeGenerated }) => {
  const [purchaseAmount, setPurchaseAmount] = useState<string>('');
  const { 
    generateCode, 
    isLoading, 
    error, 
    currentCode, 
    clearError 
  } = useCashier();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(purchaseAmount);
    
    if (isNaN(amount) || amount <= 0) {
      return;
    }

    try {
      clearError();
      const result = await generateCode(amount);
      if (result && onCodeGenerated) {
        onCodeGenerated(result.code);
      }
    } catch (error) {
      console.error('Ошибка генерации кода:', error);
    }
  };

  const handleQuickAmount = (amount: number) => {
    setPurchaseAmount(amount.toString());
  };

  return (
    <div className="code-generator">
      <h3>Генерация кода</h3>
      
      {error && (
        <div className="error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="generator-form">
        <div className="form-group">
          <label htmlFor="amount">Сумма покупки (₽):</label>
          <input
            id="amount"
            type="number"
            className="input"
            placeholder="0.00"
            value={purchaseAmount}
            onChange={(e) => setPurchaseAmount(e.target.value)}
            min="0"
            step="0.01"
            required
          />
        </div>

        <div className="quick-amounts">
          <p>Быстрые суммы:</p>
          <div className="quick-buttons">
            {[100, 200, 500, 1000, 2000].map((amount) => (
              <button
                key={amount}
                type="button"
                className="btn btn-outline"
                onClick={() => handleQuickAmount(amount)}
              >
                {amount}₽
              </button>
            ))}
          </div>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isLoading || !purchaseAmount}
        >
          {isLoading ? 'Генерация...' : 'Сгенерировать код'}
        </button>
      </form>

      {currentCode && (
        <div className="generated-code">
          <h4>Сгенерированный код:</h4>
          <div className="code-display">
            <span className="code-text">{currentCode}</span>
            <button 
              className="btn btn-copy"
              onClick={() => navigator.clipboard.writeText(currentCode)}
            >
              Копировать
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeGenerator;
