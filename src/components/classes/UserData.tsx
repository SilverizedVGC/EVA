import Category from "./Category";
import Transaction from "./Transaction";

export default class UserData {
    private categories: Category[];
    private transactions: Transaction[];

    constructor() {
        this.categories = [];
        this.transactions = [];
    }

    /* CATEGORY METHODS */
    getCategories(): Category[] {
        return this.categories;
    }

    getCategoryById(id: string): Category | undefined {
        return this.categories.find(category => category.getId() === id);
    }

    setCategories(categories: Category[]): void {
        this.categories = categories;
    }

    addCategory(category: Category): void {
        this.categories.push(category);
    }

    editCategory(id: string, updatedCategory: Category): void {
        const index = this.categories.findIndex(category => category.getId() === id);
        if (index !== -1) {
            this.categories[index].setName(updatedCategory.getName());
            this.categories[index].setColor(updatedCategory.getColor());
            this.categories[index].setBudget(updatedCategory.getBudget());
        }
    }

    removeCategory(id: string): void {
        this.categories = this.categories.filter(category => category.getId() !== id);
    }

    categorySize(): number {
        return this.categories.length;
    }

    calculateTotalIncome(): number {
        let total = 0;
        this.categories.forEach(category => {
            total += this.calculateIncome(category.getId());
        });
        return total;
    }

    calculateTotalExpense(): number {
        let total = 0;
        this.categories.forEach(category => {
            total += this.calculateExpense(category.getId());
        });
        return total;
    }

    calculateTotalRemainingBudget(): number {
        let total = 0;
        this.categories.forEach(category => {
            total += this.calculateRemainingBudget(category.getId());
        });
        return total;
    }

    calculateSavingRate(): number {
        const totalIncome = this.calculateTotalIncome();
        const totalExpense = this.calculateTotalExpense();
        if (totalIncome === 0) return 0;
        return ((totalIncome - totalExpense) / totalIncome) * 100;
    }

    // sortCategoryDate(): void {
    //     this.categories.forEach(category => category.sortDate());
    // }

    // sortCategoryName(): void {
    //     this.categories.sort((a, b) => a.getName().localeCompare(b.getName()));
    // }

    // searchCategoryDate(date: Date): Category[] {
    //     return this.categories.filter(category => {
    //         const categoryDate = category.getDate();
    //         return categoryDate.getFullYear() === date.getFullYear() &&
    //                categoryDate.getMonth() === date.getMonth() &&
    //                categoryDate.getDate() === date.getDate();
    //     });
    // }

    /* TRANSACTION METHODS */
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
            this.transactions[index].setCategoryId(updatedTransaction.getCategoryId());
        }
    }

    removeTransaction(id: string): void {
        this.transactions = this.transactions.filter(transaction => transaction.getId() !== id);
    }

    transactionSize(): number {
        return this.transactions.length;
    }

    calculateIncome(categoryId: string): number {
        return this.transactions
            .filter(transaction => transaction.getType() === 'income' && transaction.getCategoryId() === categoryId)
            .reduce((sum, transaction) => sum + transaction.getAmount(), 0);
    }

    calculateExpense(castegoryId: string): number {
        return this.transactions
            .filter(transaction => transaction.getType() === 'expense' && transaction.getCategoryId() === castegoryId)
            .reduce((sum, transaction) => sum + transaction.getAmount(), 0);
    }

    calculateRemainingBudget(categoryId: string): number {
        const category = this.getCategoryById(categoryId);
        if (!category) return 0;
        return category.getBudget() - this.calculateExpense(categoryId);
    }

    calculateUsage(categoryId: string): number {
        const category = this.getCategoryById(categoryId);
        if (!category) return 0;
        return category.getBudget() === 0 ? 0 : (this.calculateExpense(categoryId) / category.getBudget()) * 100;
    }

    sortTransactionDate(): void {
        this.transactions.sort((a, b) => b.getDate().getTime() - a.getDate().getTime());
    }

    sortTransactionAmount(): void {
        this.transactions.sort((a, b) => b.getAmount() - a.getAmount());
    }

    searchTransactionDate(date: Date): Transaction[] {
        return this.transactions.filter(transaction => {
            const transactionDate = transaction.getDate();
            return transactionDate.getFullYear() === date.getFullYear() &&
                   transactionDate.getMonth() === date.getMonth() &&
                   transactionDate.getDate() === date.getDate();
        });
    }
}