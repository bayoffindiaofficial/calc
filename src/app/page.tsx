"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function CalculatorPage() {
  const [displayValue, setDisplayValue] = useState("0");
  const [currentValue, setCurrentValue] = useState("");
  const [previousValue, setPreviousValue] = useState("");
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [calculationHistory, setCalculationHistory] = useState<string[]>([]);

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

  const buttons = [
    "C", "/", "*", "-",
    "7", "8", "9", "+",
    "4", "5", "6",
    "1", "2", "3",
    "0", ".", "="
  ];

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen bg-background p-4 gap-8">
      <Card className="w-full max-w-sm shadow-xl rounded-xl border border-border">
        <CardHeader className="pb-4">
          {/* Removed CardTitle as requested */}
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            value={displayValue}
            readOnly
            className="w-full text-right text-5xl mb-6 h-20 bg-muted-foreground/10 border-border rounded-lg shadow-inner px-4"
          />
          <div className="grid grid-cols-4 gap-3">
            {buttons.map((button) => (
              <Button
                key={button}
                className={`h-20 text-2xl font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out
                  ${
                    ["+", "-", "*", "/"].includes(button)
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95"
                      : button === "="
                      ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-95" // Distinct color for equals
                      : button === "C"
                      ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-95"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/90 active:scale-95"
                  } 
                  ${button === "0" ? "col-span-2" : ""}`}
                onClick={() => {
                  if (button === "C") {
                    handleClearClick();
                  } else if (["+", "-", "*", "/"].includes(button)) {
                    handleOperatorClick(button);
                  } else if (button === "=") {
                    handleEqualsClick();
                  } else if (button === ".") {
                    handleDecimalClick();
                  } else {
                    handleDigitClick(button);
                  }
                }}
              >
                {button}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
}