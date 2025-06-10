"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MadeWithDyad } from "@/components/made-with-dyad";

export default function CalculatorPage() {
  const [displayValue, setDisplayValue] = useState("0");
  const [currentValue, setCurrentValue] = useState("");
  const [previousValue, setPreviousValue] = useState("");
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [calculationHistory, setCalculationHistory] = useState<string[]>([]);
  const [memoryValue, setMemoryValue] = useState<number>(0);

  const handleDigitClick = (digit: string) => {
    if (displayValue === "Error") {
      setDisplayValue(digit);
      setCurrentValue(digit);
      setWaitingForOperand(false);
      setPreviousValue("");
      setOperator(null);
      return;
    }

    if (waitingForOperand) {
      setCurrentValue(digit);
      setDisplayValue(digit);
      setWaitingForOperand(false);
    } else {
      setCurrentValue((prev) => {
        const newValue = prev === "0" ? digit : prev + digit;
        setDisplayValue(newValue);
        return newValue;
      });
    }
  };

  const handleDecimalClick = () => {
    if (displayValue === "Error") {
      setDisplayValue("0.");
      setCurrentValue("0.");
      setWaitingForOperand(false);
      setPreviousValue("");
      setOperator(null);
      return;
    }

    if (waitingForOperand) {
      setCurrentValue("0.");
      setDisplayValue("0.");
      setWaitingForOperand(false);
    } else if (!currentValue.includes(".")) {
      setCurrentValue((prev) => {
        const newValue = prev === "" ? "0." : prev + ".";
        setDisplayValue(newValue);
        return newValue;
      });
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
    setDisplayValue(resultString);
    setCurrentValue(resultString);
    setPreviousValue("");
    setOperator(null);
    setWaitingForOperand(true); // Ready for next operation or new number
    setCalculationHistory((prevHistory) => [...prevHistory, `${operationString} = ${resultString}`]);
  };

  const handleOperatorClick = (nextOperator: string) => {
    if (displayValue === "Error") {
      setPreviousValue(currentValue);
      setOperator(nextOperator);
      setWaitingForOperand(true);
      return;
    }

    if (currentValue === "" && previousValue === "") return; // No number entered yet

    if (previousValue === "") {
      setPreviousValue(currentValue);
      setOperator(nextOperator);
      setWaitingForOperand(true);
    } else if (currentValue !== "" && !waitingForOperand) {
      performCalculation();
      setPreviousValue(currentValue); // Use the result as the new previous value
      setOperator(nextOperator);
      setWaitingForOperand(true);
    } else {
      setOperator(nextOperator); // Change operator if waiting for operand
    }
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
    setDisplayValue("0");
    setCurrentValue("");
    setWaitingForOperand(false);
  };

  const handleBackspace = () => {
    if (displayValue === "Error") {
      handleClearClick();
      return;
    }
    if (currentValue.length > 1) {
      const newValue = currentValue.slice(0, -1);
      setCurrentValue(newValue);
      setDisplayValue(newValue);
    } else {
      setCurrentValue("");
      setDisplayValue("0");
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
      setWaitingForOperand(true);
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
    setWaitingForOperand(false);
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
  ];

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen bg-background p-4 gap-8">
      <div className="flex flex-col md:flex-row gap-8 items-center"> {/* Added items-center here */}
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
                className="w-full text-right text-5xl h-20 bg-muted-foreground/10 border-border rounded-lg shadow-inner px-4 text-foreground"
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
                    ${button.label === "0" ? "col-span-2" : ""}`}
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
                  <li key={index} className="text-lg text-foreground break-words">
                    {entry}
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
      <MadeWithDyad />
    </div>
  );
}