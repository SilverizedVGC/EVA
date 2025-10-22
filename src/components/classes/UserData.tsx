import { Category } from "./Category";

export class UserData {
    private categories: Category[];

    constructor() {
        this.categories = [];
    }

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
            this.categories[index].setTransactions(updatedCategory.getTransactions());
        }
    }

    removeCategory(id: string): void {
        this.categories = this.categories.filter(category => category.getId() !== id);
    }

    size(): number {
        return this.categories.length;
    }

    calculateTotalIncome(): number {
        let total = 0;
        this.categories.forEach(category => {
            category.getTransactions().forEach(transaction => {
                if (transaction.getType() === 'income') {
                    total += transaction.getAmount();
                }
            });
        });
        return total;
    }

    calculateTotalExpense(): number {
        let total = 0;
        this.categories.forEach(category => {
            category.getTransactions().forEach(transaction => {
                if (transaction.getType() === 'expense') {
                    total += transaction.getAmount();
                }
            });
        });
        return total;
    }

    calculateTotalRemainBudget(): number {
        let total = 0;
        this.categories.forEach(category => {
            total += category.calculateRemainBudget();
        });
        return total;
    }

    calculateSavingRate(): number {
        const totalIncome = this.calculateTotalIncome();
        const totalExpense = this.calculateTotalExpense();
        if (totalIncome === 0) return 0;
        return ((totalIncome - totalExpense) / totalIncome) * 100;
    }

    sortDate(): void {
        this.categories.forEach(category => category.sortDate());
    }

    sortName(): void {
        this.categories.sort((a, b) => a.getName().localeCompare(b.getName()));
    }

    searchDate(date: Date): Category[] {
        return this.categories.filter(category => {
            const categoryDate = category.getDate();
            return categoryDate.getFullYear() === date.getFullYear() &&
                   categoryDate.getMonth() === date.getMonth() &&
                   categoryDate.getDate() === date.getDate();
        });
    }
}