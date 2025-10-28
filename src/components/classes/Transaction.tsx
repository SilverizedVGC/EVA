export default class Transaction {
    private id: string; // primary key
    private date: Date; // final
    private amount: number; // final
    private type: 'expense' | 'income'; // final
    private description: string; // changeable
    private categoryId: string; // changeable

    constructor(
        id: string,
        date: Date,
        amount: number,
        type: 'expense' | 'income',
        description: string,
        categoryId: string
    ) {
        this.id = id;
        this.date = date;
        this.amount = amount;
        this.type = type;
        this.description = description;
        this.categoryId = categoryId;
    }

    getId(): string {
        return this.id;
    }

    getDate(): Date {
        return this.date;
    }

    getAmount(): number {
        return this.amount;
    }

    getType(): 'expense' | 'income' {
        return this.type;
    }

    getDescription(): string {
        return this.description;
    }

    setDescription(description: string): void {
        this.description = description;
    }

    getCategoryId(): string {
        return this.categoryId;
    }

    setCategoryId(category: string): void {
        this.categoryId = category;
    }
}