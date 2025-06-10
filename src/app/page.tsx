"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";


export default function CalculatorPage() {
  const [displayValue, setDisplayValue] = useState("0"); // This will now hold the full expression or current number
  const [currentValue, setCurrentValue] = useState(""); // The number currently being typed
  const [previousValue, setPreviousValue] = useState(""); // The first operand
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false); // True after operator, waiting for second number
  const [calculationHistory, setCalculationHistory] = useState<string[]>([]);
  const [memoryValue, setMemoryValue] = useState<number>(0);

  // Memoize stable setters (though not strictly necessary for useCallback dependencies, good practice)
  const setDisplayValueCallback = useCallback(setDisplayValue, []);
  const setCurrentValueCallback = useCallback(setCurrentValue, []);
  const setPreviousValueCallback = useCallback(setPreviousValue, []);
  const setOperatorCallback = useCallback(setOperator, []);
  const setWaitingForOperandCallback = useCallback(setWaitingForOperand, []);
  const setCalculationHistoryCallback = useCallback(setCalculationHistory, []);
  const setMemoryValueCallback = useCallback(setMemoryValue, []);

  const handleClearClick = useCallback(() => {
    setDisplayValueCallback("0");
    setCurrentValueCallback("");
    setPreviousValueCallback("");
    setOperatorCallback(null);
    setWaitingForOperandCallback(false);
    setCalculationHistoryCallback([]); // Clear history on C
  }, [setDisplayValueCallback, setCurrentValueCallback, setPreviousValueCallback, setOperatorCallback, setWaitingForOperandCallback, setCalculationHistoryCallback]);

  const performCalculation = useCallback(() => {
    const prev = parseFloat(previousValue);
    const current = parseFloat(currentValue);

    if (isNaN(prev) || isNaN(current)) return;

    let result: number;
    let operationString = `${previousValue} ${operator} ${currentValue}`;

    switch (operator) {
      case "+":
        result = prev + current;
        break;
      case "-":
        result = prev - current;
        break;
      case "*":
        result = prev * current;
        break;
        case "/":
        if (current === 0) {
          setDisplayValueCallback("Error");
          setCurrentValueCallback("");
          setPreviousValueCallback("");
          setOperatorCallback(null);
          setWaitingForOperandCallback(false);
          setCalculationHistoryCallback((prevHistory) => [...prevHistory, `${operationString} = Error (Division by zero)`]);
          return;
        }
        result = prev / current;
        break;
      default:
        return;
    }

    const resultString = result.toString();
    setDisplayValueCallback(resultString); // Display the result
    setCurrentValueCallback(resultString); // Set current value to result for chaining
    setPreviousValueCallback(""); // Clear previous
    setOperatorCallback(null); // Clear operator
    setWaitingForOperandCallback(true); // Ready for next operation or new number
    setCalculationHistoryCallback((prevHistory) => [...prevHistory, `${operationString} = ${resultString}`]);
  }, [previousValue, currentValue, operator, setDisplayValueCallback, setCurrentValueCallback, setPreviousValueCallback, setOperatorCallback, setWaitingForOperandCallback, setCalculationHistoryCallback]);


  const handleDigitClick = useCallback((digit: string) => {
    if (displayValue === "Error") {
      handleClearClick();
      return;
    }

    let newCurrentValue;
    if (waitingForOperand) {
      newCurrentValue = digit;
      setWaitingForOperandCallback(false);
    } else {
      newCurrentValue = currentValue === "0" ? digit : currentValue + digit;
    }
    setCurrentValueCallback(newCurrentValue);

    if (operator && previousValue !== "") {
      setDisplayValueCallback(`${previousValue} ${operator} ${newCurrentValue}`);
    } else {
      setDisplayValueCallback(newCurrentValue);
    }
  }, [displayValue, currentValue, operator, previousValue, waitingForOperand, handleClearClick, setDisplayValueCallback, setCurrentValueCallback, setWaitingForOperandCallback]);

  const handleDecimalClick = useCallback(() => {
    if (displayValue === "Error") {
      setDisplayValueCallback("0.");
      setCurrentValueCallback("0.");
      setPreviousValueCallback("");
      setOperatorCallback(null);
      setWaitingForOperandCallback(false);
      return;
    }

    let newCurrentValue;
    if (waitingForOperand) {
      newCurrentValue = "0.";
      setWaitingForOperandCallback(false);
    } else if (!currentValue.includes(".")) {
      newCurrentValue = currentValue === "" ? "0." : currentValue + ".";
    } else {
      return;
    }
    setCurrentValueCallback(newCurrentValue);

    if (operator && previousValue !== "") {
      setDisplayValueCallback(`${previousValue} ${operator} ${newCurrentValue}`);
    } else {
      setDisplayValueCallback(newCurrentValue);
    }
  }, [displayValue, currentValue, operator, previousValue, waitingForOperand, setDisplayValueCallback, setCurrentValueCallback, setPreviousValueCallback, setOperatorCallback, setWaitingForOperandCallback]);

  const handleOperatorClick = useCallback((nextOperator: string) => {
    if (displayValue === "Error") {
      handleClearClick();
      return;
    }

    if (previousValue && operator && currentValue && !waitingForOperand) {
      performCalculation();
      setPreviousValueCallback(currentValue); // This will be the result from performCalculation in the next render cycle
    } else if (currentValue !== "") {
      setPreviousValueCallback(currentValue);
    } else if (previousValue === "" && currentValue === "") {
      setPreviousValueCallback("0");
    }

    setOperatorCallback(nextOperator);
    setDisplayValueCallback(`${previousValue || currentValue || "0"} ${nextOperator}`);
    setWaitingForOperandCallback(true);
  }, [displayValue, previousValue, operator, currentValue, waitingForOperand, performCalculation, handleClearClick, setPreviousValueCallback, setOperatorCallback, setDisplayValueCallback, setWaitingForOperandCallback]);

  const handleEqualsClick = useCallback(() => {
    if (previousValue === "" || operator === null || currentValue === "" || displayValue === "Error") return;
    performCalculation();
  }, [previousValue, operator, currentValue, displayValue, performCalculation]);

  const handleClearEntry = useCallback(() => {
    if (displayValue === "Error") {
      handleClearClick();
      return;
    }
    if (operator && previousValue !== "") {
      setCurrentValueCallback("");
      setDisplayValueCallback(`${previousValue} ${operator}`);
      setWaitingForOperandCallback(true);
    } else {
      setDisplayValueCallback("0");
      setCurrentValueCallback("");
      setPreviousValueCallback("");
      setOperatorCallback(null);
      setWaitingForOperandCallback(false);
    }
  }, [displayValue, operator, previousValue, setCurrentValueCallback, setDisplayValueCallback, setWaitingForOperandCallback, setPreviousValueCallback, setOperatorCallback, handleClearClick]);

  const handleBackspace = useCallback(() => {
    if (displayValue === "Error") {
      handleClearClick();
      return;
    }
    if (waitingForOperand) return;

    if (currentValue.length > 1) {
      const newValue = currentValue.slice(0, -1);
      setCurrentValueCallback(newValue);
      if (operator && previousValue !== "") {
        setDisplayValueCallback(`${previousValue} ${operator} ${newValue}`);
      } else {
        setDisplayValueCallback(newValue);
      }
    } else {
      setCurrentValueCallback("");
      if (operator && previousValue !== "") {
        setDisplayValueCallback(`${previousValue} ${operator}`);
        setWaitingForOperandCallback(true);
      } else {
        setDisplayValueCallback("0");
      }
    }
  }, [displayValue, currentValue, operator, previousValue, waitingForOperand, handleClearClick, setCurrentValueCallback, setDisplayValueCallback, setWaitingForOperandCallback]);

  const handlePercentage = useCallback(() => {
    if (displayValue === "Error") {
      handleClearClick();
      return;
    }
    const value = parseFloat(currentValue || displayValue);
    if (!isNaN(value)) {
      const result = value / 100;
      setDisplayValueCallback(result.toString());
      setCurrentValueCallback(result.toString());
      setWaitingForOperandCallback(true);
    }
  }, [displayValue, currentValue, handleClearClick, setDisplayValueCallback, setCurrentValueCallback, setWaitingForOperandCallback]);

  const handleMemoryAdd = useCallback(() => {
    const value = parseFloat(currentValue || displayValue);
    if (!isNaN(value)) {
      setMemoryValueCallback((prev) => prev + value);
    }
  }, [currentValue, displayValue, setMemoryValueCallback]);

  const handleMemorySubtract = useCallback(() => {
    const value = parseFloat(currentValue || displayValue);
    if (!isNaN(value)) {
      setMemoryValueCallback((prev) => prev - value);
    }
  }, [currentValue, displayValue, setMemoryValueCallback]);

  const handleMemoryRecall = useCallback(() => {
    setDisplayValueCallback(memoryValue.toString());
    setCurrentValueCallback(memoryValue.toString());
    setWaitingForOperandCallback(false);
    setPreviousValueCallback("");
    setOperatorCallback(null);
  }, [memoryValue, setDisplayValueCallback, setCurrentValueCallback, setWaitingForOperandCallback, setPreviousValueCallback, setOperatorCallback]);

  const handleMemoryClear = useCallback(() => {
    setMemoryValueCallback(0);
  }, [setMemoryValueCallback]);

  const handleGSTCalculation = useCallback((rate: number) => {
    if (displayValue === "Error") {
      handleClearClick();
      return;
    }
    const value = parseFloat(currentValue || displayValue);
    if (!isNaN(value)) {
      const result = value * (1 + rate / 100);
      const operationString = `${value} + ${rate}% GST`;
      setDisplayValueCallback(result.toString());
      setCurrentValueCallback(result.toString());
      setWaitingForOperandCallback(true);
      setCalculationHistoryCallback((prevHistory) => [...prevHistory, `${operationString} = ${result.toString()}`]);
    }
  }, [displayValue, currentValue, handleClearClick, setDisplayValueCallback, setCurrentValueCallback, setWaitingForOperandCallback, setCalculationHistoryCallback]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key } = event;

      if (key >= '0' && key <= '9') {
        handleDigitClick(key);
      } else if (key === '.') {
        handleDecimalClick();
      } else if (key === '+' || key === '-' || key === '*' || key === '/') {
        handleOperatorClick(key);
      } else if (key === 'Enter') {
        event.preventDefault();
        handleEqualsClick();
      } else if (key === 'Backspace') {
        event.preventDefault(); // Prevent default browser back navigation
        handleBackspace();
      } else if (key === 'Escape') {
        handleClearClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleDigitClick, handleDecimalClick, handleOperatorClick, handleEqualsClick, handleBackspace, handleClearClick]);

  const mainButtons = [
    { label: "MC", type: "memory", handler: handleMemoryClear },
    { label: "MR", type: "memory", handler: handleMemoryRecall },
    { label: "M+", type: "memory", handler: handleMemoryAdd },
    { label: "M-", type: "memory", handler: handleMemorySubtract },
    { label: "C", type: "clear", handler: handleClearClick },
    { label: "CE", type: "clear", handler: handleClearEntry },
    { label: "%", type: "operator", handler: handlePercentage },
    { label: "/", type: "operator", handler: () => handleOperatorClick("/") },
    { label: "7", type: "digit", handler: () => handleDigitClick("7") },
    { label: "8", type: "digit", handler: () => handleDigitClick("8") },
    { label: "9", type: "digit", handler: () => handleDigitClick("9") },
    { label: "*", type: "operator", handler: () => handleOperatorClick("*") },
    { label: "4", type: "digit", handler: () => handleDigitClick("4") },
    { label: "5", type: "digit", handler: () => handleDigitClick("5") },
    { label: "6", type: "digit", handler: () => handleDigitClick("6") },
    { label: "-", type: "operator", handler: () => handleOperatorClick("-") },
    { label: "1", type: "digit", handler: () => handleDigitClick("1") },
    { label: "2", type: "digit", handler: () => handleDigitClick("2") },
    { label: "3", type: "digit", handler: () => handleDigitClick("3") },
    { label: "+", type: "operator", handler: () => handleOperatorClick("+") },
    { label: "0", type: "digit", handler: () => handleDigitClick("0") },
    { label: ".", type: "decimal", handler: handleDecimalClick },
    { label: "DEL", type: "backspace", handler: handleBackspace },
    { label: "=", type: "equals", handler: handleEqualsClick },
  ];

  const gstButtons = [
    { label: "0% GST", handler: () => handleGSTCalculation(0) },
    { label: "5% GST", handler: () => handleGSTCalculation(5) },
    { label: "9% GST", handler: () => handleGSTCalculation(9) },
    { label: "12% GST", handler: () => handleGSTCalculation(12) },
    { label: "18% GST", handler: () => handleGSTCalculation(18) },
    { label: "28% GST", handler: () => handleGSTCalculation(28) },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 gap-8">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8"> {/* Container for calculator and GST buttons */}
        <Card className="w-full max-w-sm shadow-xl rounded-xl border border-border">
          <CardHeader className="pb-4">
            {/* Removed CardTitle as requested */}
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-2 px-2">
              <span className="text-sm text-muted-foreground">M: {memoryValue.toFixed(2)}</span>
              <Input
                type="text"
                value={displayValue}
                onChange={() => {}}
                className="w-full text-right text-5xl lg:text-6xl h-20 bg-muted-foreground/10 border-border rounded-lg shadow-inner px-4 text-foreground"
              />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {mainButtons.map((button) => (
                <Button
                  key={button.label}
                  className={`h-20 text-2xl font-bold rounded-lg shadow-md transition-all duration-200 ease-in-out
                    ${
                      button.type === "operator"
                        ? "bg-gray-800 text-white hover:bg-gray-700 active:scale-95"
                        : button.type === "equals"
                        ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                        : button.type === "clear" || button.label === "DEL"
                        ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-95"
                        : button.type === "memory"
                        ? "bg-purple-600 text-white hover:bg-purple-700 active:scale-95"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/90 active:scale-95"
                    }
                    ${button.label === "0" ? "" : ""} ${button.label === "DEL" || button.label === "=" ? "" : ""}`}
                  onClick={button.handler}
                >
                  {button.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="w-full max-w-[200px] shadow-xl rounded-xl border border-border flex flex-col p-4">
          <CardTitle className="text-center text-lg font-bold text-primary-foreground bg-primary py-2 rounded-md mb-4">GST</CardTitle>
          <div className="grid grid-cols-2 gap-3">
            {gstButtons.map((button) => (
              <Button
                key={button.label}
                className="h-16 text-lg font-bold rounded-lg shadow-md transition-all duration-200 ease-in-out bg-green-600 text-white hover:bg-green-700 active:scale-95"
                onClick={button.handler}
              >
                {button.label}
              </Button>
            ))}
          </div>
        </Card>
      </div>

      <Card className="w-full max-w-sm shadow-xl rounded-xl border border-border lg:h-[500px] flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="text-center text-2xl font-bold text-primary-foreground bg-primary py-3 rounded-t-xl -mx-6 -mt-6 mb-4">Calculation History</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
          <ScrollArea className="h-full w-full pr-4">
            {calculationHistory.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No calculations yet.</p>
            ) : (
              <ul className="space-y-2">
                {calculationHistory.map((entry, index) => (
                  <li key={index} className="text-lg lg:text-xl text-foreground break-words">
                    {entry}
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
      <div className="p-4 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Made By Saswata</p>
      </div>
    </div>
  );
}