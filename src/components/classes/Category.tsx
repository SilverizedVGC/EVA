import Transaction from "./Transaction";

export default class Category {
    private id: string; // primary key
    private date: Date; // final
    private name: string; // changeable
    private color: string; // changeable
    private budget: number; // changeable
    private transactions: Transaction[]; // changeable

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
        this.transactions = [];
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

    getTransactions(): Transaction[] {
        return this.transactions;
    }

    getTransactionById(id: string): Transaction | undefined {
        return this.transactions.find(transaction => transaction.getId() === id);
    }

    setTransactions(transactions: Transaction[]): void {
        this.transactions = transactions;
    }

    addTransaction(transaction: Transaction): void {
        this.transactions.push(transaction);
    }

    editTransaction(id: string, updatedTransaction: Transaction): void {
        const index = this.transactions.findIndex(transaction => transaction.getId() === id);
        if (index !== -1) {
            this.transactions[index].setDescription(updatedTransaction.getDescription());
            this.transactions[index].setCategory(updatedTransaction.getCategory());
        }
    }

    removeTransaction(id: string): void {
        this.transactions = this.transactions.filter(transaction => transaction.getId() !== id);
    }

    size(): number {
        return this.transactions.length;
    }

    calculateExpense(): number {
        return this.transactions
            .filter(transaction => transaction.getType() === 'expense')
            .reduce((sum, transaction) => sum + transaction.getAmount(), 0);
    }

    calculateRemainBudget(): number {
        return this.budget - this.calculateExpense();
    }

    calculateTotalAmount(): number {
        return this.transactions
            .reduce((sum, transaction) => sum + transaction.getAmount(), 0);
    }

    calculateUsage(): number {
        const expense = this.calculateExpense();
        return this.budget === 0 ? 0 : (expense / this.budget) * 100;
    }

    sortDate(): void {
        this.transactions.sort((a, b) => b.getDate().getTime() - a.getDate().getTime());
    }

    sortAmount(): void {
        this.transactions.sort((a, b) => b.getAmount() - a.getAmount());
    }

    searchDate(date: Date): Transaction[] {
        return this.transactions.filter(transaction => {
            const transactionDate = transaction.getDate();
            return transactionDate.getFullYear() === date.getFullYear() &&
                   transactionDate.getMonth() === date.getMonth() &&
                   transactionDate.getDate() === date.getDate();
        });
    }
}