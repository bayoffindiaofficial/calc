"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CalculatorPage() {
  const [displayValue, setDisplayValue] = useState("0");
  const [currentValue, setCurrentValue] = useState("");
  const [previousValue, setPreviousValue] = useState("");
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const handleDigitClick = (digit: string) => {
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
  };

  const handleOperatorClick = (nextOperator: string) => {
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
    if (previousValue === "" || operator === null || currentValue === "") return;
    performCalculation();
  };

  const handleClearClick = () => {
    setDisplayValue("0");
    setCurrentValue("");
    setPreviousValue("");
    setOperator(null);
    setWaitingForOperand(false);
  };

  const buttons = [
    "C", "/", "*", "-",
    "7", "8", "9", "+",
    "4", "5", "6",
    "1", "2", "3",
    "0", ".", "="
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            value={displayValue}
            readOnly
            className="w-full text-right text-4xl mb-4 h-16 bg-muted-foreground/10 border-border"
          />
          <div className="grid grid-cols-4 gap-2">
            {buttons.map((button) => (
              <Button
                key={button}
                className={`h-16 text-xl ${
                  ["+", "-", "*", "/", "="].includes(button)
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : button === "C"
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                } ${button === "0" ? "col-span-2" : ""}`}
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
    </div>
  );
}