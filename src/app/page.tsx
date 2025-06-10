"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MadeWithDyad } from "@/components/made-with-dyad";

export default function CalculatorPage() {
  const [displayValue, setDisplayValue] = useState("0"); // This will now hold the full expression or current number
  const [currentValue, setCurrentValue] = useState(""); // The number currently being typed
  const [previousValue, setPreviousValue] = useState(""); // The first operand
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false); // True after operator, waiting for second number
  const [calculationHistory, setCalculationHistory] = useState<string[]>([]);
  const [memoryValue, setMemoryValue] = useState<number>(0);

  const handleDigitClick = (digit: string) => {
    if (displayValue === "Error") {
      setDisplayValue(digit);
      setCurrentValue(digit);
      setPreviousValue("");
      setOperator(null);
      setWaitingForOperand(false);
      return;
    }

    let newCurrentValue;
    if (waitingForOperand) {
      newCurrentValue = digit;
      setWaitingForOperand(false);
    } else {
      newCurrentValue = currentValue === "0" ? digit : currentValue + digit;
    }
    setCurrentValue(newCurrentValue);

    // Update display to show full expression if operator is present, otherwise just the current number
    if (operator && previousValue !== "") {
      setDisplayValue(`${previousValue} ${operator} ${newCurrentValue}`);
    } else {
      setDisplayValue(newCurrentValue);
    }
  };

  const handleDecimalClick = () => {
    if (displayValue === "Error") {
      setDisplayValue("0.");
      setCurrentValue("0.");
      setPreviousValue("");
      setOperator(null);
      setWaitingForOperand(false);
      return;
    }

    let newCurrentValue;
    if (waitingForOperand) {
      newCurrentValue = "0."; // Start with "0." if waiting for operand
      setWaitingForOperand(false);
    } else if (!currentValue.includes(".")) {
      newCurrentValue = currentValue === "" ? "0." : currentValue + ".";
    } else {
      // If decimal already exists and not waiting for operand, do nothing
      return;
    }
    setCurrentValue(newCurrentValue);

    // Construct the display string
    if (operator && previousValue !== "") {
      setDisplayValue(`${previousValue} ${operator} ${newCurrentValue}`);
    } else {
      setDisplayValue(newCurrentValue);
    }
  };

  const performCalculation = () => {
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
          setDisplayValue("Error");
          setCurrentValue("");
          setPreviousValue("");
          setOperator(null);
          setWaitingForOperand(false);
          setCalculationHistory((prevHistory) => [...prevHistory, `${operationString} = Error (Division by zero)`]);
          return;
        }
        result = prev / current;
        break;
      default:
        return;
    }

    const resultString = result.toString();
    setDisplayValue(resultString); // Display the result
    setCurrentValue(resultString); // Set current value to result for chaining
    setPreviousValue(""); // Clear previous
    setOperator(null); // Clear operator
    setWaitingForOperand(true); // Ready for next operation or new number
    setCalculationHistory((prevHistory) => [...prevHistory, `${operationString} = ${resultString}`]);
  };

  const handleOperatorClick = (nextOperator: string) => {
    if (displayValue === "Error") {
      handleClearClick(); // Reset from error state
      return;
    }

    // If there's a previous value, an operator, and a current value (and not waiting for operand),
    // it means a calculation is pending. Perform it first.
    if (previousValue && operator && currentValue && !waitingForOperand) {
      performCalculation();
      // After performCalculation, currentValue will hold the result, and previousValue/operator will be cleared.
      // We then use this result as the new previousValue for the next operation.
      setPreviousValue(currentValue);
    } else if (currentValue !== "") {
      // If no previous operation, but a number is typed, set it as previous.
      setPreviousValue(currentValue);
    } else if (previousValue === "" && currentValue === "") {
      // If nothing is typed yet, default to 0 as previous value
      setPreviousValue("0");
    }

    setOperator(nextOperator);
    setDisplayValue(`${previousValue || currentValue || "0"} ${nextOperator}`); // Show the first operand and the new operator
    setWaitingForOperand(true); // Now waiting for the second operand
  };

  const handleEqualsClick = () => {
    if (previousValue === "" || operator === null || currentValue === "" || displayValue === "Error") return;
    performCalculation();
  };

  const handleClearClick = () => {
    setDisplayValue("0");
    setCurrentValue("");
    setPreviousValue("");
    setOperator(null);
    setWaitingForOperand(false);
    setCalculationHistory([]); // Clear history on C
  };

  const handleClearEntry = () => {
    if (displayValue === "Error") {
      handleClearClick(); // If error, clear all
      return;
    }
    // If an operator is set, clearing entry should only clear the current number, not the previous value or operator
    if (operator && previousValue !== "") {
      setCurrentValue("");
      setDisplayValue(`${previousValue} ${operator}`);
      setWaitingForOperand(true); // Still waiting for the second operand
    } else {
      // If no operator or previous value, clear everything like C
      setDisplayValue("0");
      setCurrentValue("");
      setPreviousValue("");
      setOperator(null);
      setWaitingForOperand(false);
    }
  };

  const handleBackspace = () => {
    if (displayValue === "Error") {
      handleClearClick();
      return;
    }
    if (waitingForOperand) return; // Cannot backspace if waiting for new operand

    if (currentValue.length > 1) {
      const newValue = currentValue.slice(0, -1);
      setCurrentValue(newValue);
      if (operator && previousValue !== "") {
        setDisplayValue(`${previousValue} ${operator} ${newValue}`);
      } else {
        setDisplayValue(newValue);
      }
    } else {
      setCurrentValue("");
      if (operator && previousValue !== "") {
        setDisplayValue(`${previousValue} ${operator}`);
        setWaitingForOperand(true); // If current value becomes empty, go back to waiting for operand
      } else {
        setDisplayValue("0");
      }
    }
  };

  const handlePercentage = () => {
    if (displayValue === "Error") {
      handleClearClick();
      return;
    }
    const value = parseFloat(currentValue || displayValue);
    if (!isNaN(value)) {
      const result = value / 100;
      setDisplayValue(result.toString());
      setCurrentValue(result.toString());
      setWaitingForOperand(true); // After percentage, ready for next operation
    }
  };

  const handleMemoryAdd = () => {
    const value = parseFloat(currentValue || displayValue);
    if (!isNaN(value)) {
      setMemoryValue((prev) => prev + value);
    }
  };

  const handleMemorySubtract = () => {
    const value = parseFloat(currentValue || displayValue);
    if (!isNaN(value)) {
      setMemoryValue((prev) => prev - value);
    }
  };

  const handleMemoryRecall = () => {
    setDisplayValue(memoryValue.toString());
    setCurrentValue(memoryValue.toString());
    setWaitingForOperand(false); // A number is now in display, not waiting for operand
    setPreviousValue(""); // Clear previous value as this is a new starting point
    setOperator(null); // Clear operator
  };

  const handleMemoryClear = () => {
    setMemoryValue(0);
  };

  const handleGSTCalculation = (rate: number) => {
    if (displayValue === "Error") {
      handleClearClick();
      return;
    }
    const value = parseFloat(currentValue || displayValue);
    if (!isNaN(value)) {
      const result = value * (1 + rate / 100);
      const operationString = `${value} + ${rate}% GST`;
      setDisplayValue(result.toString());
      setCurrentValue(result.toString());
      setWaitingForOperand(true);
      setCalculationHistory((prevHistory) => [...prevHistory, `${operationString} = ${result.toString()}`]);
    }
  };

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
        event.preventDefault(); // Prevent default form submission or other browser behavior
        handleEqualsClick();
      } else if (key === 'Backspace') {
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
    { label: "9% GST", handler: () => handleGSTCalculation(9) },
    { label: "12% GST", handler: () => handleGSTCalculation(12) },
    { label: "18% GST", handler: () => handleGSTCalculation(18) },
    { label: "28% GST", handler: () => handleGSTCalculation(28) },
    { label: "5% GST", handler: () => handleGSTCalculation(5) }, // Changed from 48% to 5%
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
                readOnly
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
        <MadeWithDyad />
      </div>
    </div>
  );
}