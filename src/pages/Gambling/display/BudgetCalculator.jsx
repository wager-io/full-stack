import React from 'react';

export default function BudgetCalculator() {
  const incomeItems = [
    'Wages after deductions',
    'Pensions',
    'Benefits',
    'Other income',
  ];

  const expenseItems = [
    'Rent/mortgage',
    'Utility bills',
    'Loans/credit',
    'Other expenses',
  ];

  return (
    <div className="min-h-screen bg-[#0e1723] text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-6xl bg-[#1b2a38] rounded-xl shadow-2xl p-6 md:p-10">
        <div className="bg-[#1a73e8] p-4 rounded-lg mb-6">
          <img src="/responsible-gambling-budget-calculator-en.svg" alt="" />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Monthly Budget Calculator</h1>
          <p className="text-sm text-gray-300">
            Your information is confidential and is not visible to Stake.
          </p>
        </div>

        {/* Income + Expenses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Income */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Income</h2>
            {incomeItems.map((label, idx) => (
              <div key={idx} className="mb-4">
                <label className="block text-sm mb-1">{label}</label>
                <div className="bg-[#1a2533] rounded-md px-4 py-3 flex items-center justify-between shadow-white-2px">
                  <input
                    type="number"
                    defaultValue="0.00"
                    className="bg-transparent text-left w-full focus:outline-none"
                  />
                  <span className="text-green-400 text-sm ml-2">$</span>
                </div>
              </div>
            ))}

            {/* Total Income */}
            <div className="mt-6">
              <label className="block text-sm mb-1 font-semibold">Total income</label>
              <div className="bg-[#1a2533] rounded-md px-4 py-3 flex items-center justify-between shadow-white-2px">
                <input
                  type="number"
                  value="0.00"
                  disabled
                  className="bg-transparent text-left w-full text-white"
                />
                <span className="text-green-400 text-sm ml-2">$</span>
              </div>
            </div>
          </div>

          {/* Expenses */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Expenses</h2>
            {expenseItems.map((label, idx) => (
              <div key={idx} className="mb-4">
                <label className="block text-sm mb-1">{label}</label>
                <div className="bg-[#1a2533] rounded-md px-4 py-3 flex items-center justify-between shadow-white-2px">
                  <input
                    type="number"
                    defaultValue="0.00"
                    className="bg-transparent text-left w-full focus:outline-none"
                  />
                  <span className="text-green-400 text-sm ml-2">$</span>
                </div>
              </div>
            ))}

            {/* Total Expenses */}
            <div className="mt-6">
              <label className="block text-sm mb-1 font-semibold">Total expenses</label>
              <div className="bg-[#1a2533] rounded-md px-4 py-3 flex items-center justify-between shadow-white-2px">
                <input
                  type="number"
                  value="0.00"
                  disabled
                  className="bg-transparent text-left w-full text-white"
                />
                <span className="text-green-400 text-sm ml-2">$</span>
              </div>
            </div>
          </div>
        </div>

        {/* Disposable Income */}
        <div className="mt-10">
          <label className="text-sm font-semibold mb-1 block">Disposable income</label>
          <div className="bg-[#1a2533] px-4 py-3 rounded-md flex items-center justify-between shadow-white-4px">
            <span className="text-white font-bold text-lg">$0.00</span>
            <span className="text-green-400 font-bold text-lg">$</span>
          </div>
        </div>
      </div>
    </div>
  );
}
