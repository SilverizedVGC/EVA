import Transaction from "./Transaction";

export default class Category {
    private id: string; // primary key
    private date: Date; // final
    private name: string; // changeable
    private color: string; // changeable
    private budget: number; // changeable

    constructor(
        id: string,
        date: Date,
        name: string,
        color: string,
        budget: number
    ) {
        this.id = id;
        this.date = date;
        this.name = name;
        this.color = color;
        this.budget = budget;
    }

    getId(): string {
        return this.id;
    }

    getDate(): Date {
        return this.date;
    }

    getName(): string {
        return this.name;
    }

    setName(name: string): void {
        this.name = name;
    }

    getColor(): string {
        return this.color;
    }

    setColor(color: string): void {
        this.color = color;
    }

    getBudget(): number {
        return this.budget;
    }

    setBudget(budget: number): void {
        this.budget = budget;
    }
}