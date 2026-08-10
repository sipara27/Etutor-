import Decimal from "decimal.js";

export function convertToTwoDecimals(num: number): number {
    // Use toFixed for easy conversion with rounding half-way up
      const numStr = num.toFixed(2);
      return Number(numStr);
  }

export function multiply(...numbers: number[]): number {
  let result = new Decimal(1);
  for (const num of numbers) {
    result = result.mul(new Decimal(num || 0));
  }
  return Number(result)
}

export function add(...numbers: number[]) : number {
  let result = new Decimal(0);
  for (const num of numbers) {
    result = result.add(new Decimal(num || 0));
  }
  return Number(result)
}

export function divide(dividend: number, divisor: number): number{

    return Number(new Decimal(dividend || 0).div(divisor))
}

export function sub(sub: number, substructor: number): number{

  return Number(new Decimal(sub || 0).sub(substructor))
}