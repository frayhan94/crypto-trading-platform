export class Percentage {
  private constructor(
    public readonly value: number
  ) {}

  static create(value: number): Percentage {
    if (value < 0 || value > 100) {
      throw new Error('Percentage must be between 0 and 100');
    }
    return new Percentage(value);
  }

  static fromDecimal(decimal: number): Percentage {
    return Percentage.create(decimal * 100);
  }

  toDecimal(): number {
    return this.value / 100;
  }

  of(amount: number): number {
    return amount * this.toDecimal();
  }

  add(other: Percentage): Percentage {
    return Percentage.create(this.value + other.value);
  }

  subtract(other: Percentage): Percentage {
    return Percentage.create(this.value - other.value);
  }

  multiply(multiplier: number): Percentage {
    return Percentage.create(this.value * multiplier);
  }

  divide(divisor: number): Percentage {
    if (divisor === 0) {
      throw new Error('Cannot divide by zero');
    }
    return Percentage.create(this.value / divisor);
  }

  isGreaterThan(other: Percentage): boolean {
    return this.value > other.value;
  }

  isLessThan(other: Percentage): boolean {
    return this.value < other.value;
  }

  equals(other: Percentage): boolean {
    return this.value === other.value;
  }

  toFormattedString(): string {
    return `${this.value.toFixed(2)}%`;
  }

  toString(): string {
    return `${this.value}%`;
  }
}
