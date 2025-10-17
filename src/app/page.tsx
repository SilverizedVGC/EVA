'use client'
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { BudgetDashboard } from "@/components/BudgetDashboard"
import { BudgetManager } from "@/components/BudgetManager"
import { ExpenseTracker } from "@/components/ExpenseTracker"
import { BudgetAnalytics } from "@/components/BudgetAnalytics"
import { BarChart3, PlusCircle, DollarSign, TrendingUp } from "lucide-react"

interface Transaction {
  id: string
  description: string
  amount: number
  category: string
  date: string
  type: 'expense' | 'income'
}

interface BudgetItem {
  id: string
  category: string
  budgeted: number
  spent: number
  color: string
}

// Sample data for demonstration
const sampleBudgets: BudgetItem[] = [
  { id: '1', category: 'Transportation', budgeted: 500, spent: 320, color: '#ef4444' },
  { id: '2', category: 'Entertainment', budgeted: 200, spent: 150, color: '#f97316' },
  { id: '3', category: 'Rent', budgeted: 1350, spent: 180, color: '#eab308' },
  { id: '4', category: 'Fast Food', budgeted: 300, spent: 275, color: '#22c55e' },
  { id: '5', category: 'Groceries', budgeted: 400, spent: 225, color: '#06b6d4' },
]

const sampleTransactions: Transaction[] = [
  { id: '1', description: 'Chevron', amount: 85.50, category: 'Transportation', date: '2024-12-15', type: 'expense' },
  { id: '2', description: 'Safeway', amount: 45.00, category: 'Groceries', date: '2024-12-14', type: 'expense' },
  { id: '3', description: 'Monthly Salary', amount: 3500.00, category: 'Salary', date: '2024-12-01', type: 'income' },
  { id: '4', description: 'Five Guys', amount: 25.00, category: 'Fast Food', date: '2024-12-13', type: 'expense' },
  { id: '5', description: 'Safeway', amount: 120.00, category: 'Groceries', date: '2024-12-3', type: 'expense' },
  { id: '6', description: 'Ticketmaster', amount: 167.30, category: 'Entertainment', date: '2024-12-11', type: 'expense' },
  { id: '7', description: 'Safeway', amount: 92.75, category: 'Groceries', date: '2024-12-10', type: 'expense' },
  { id: '8', description: 'Chipotle', amount: 38.20, category: 'Fast Food', date: '2024-12-09', type: 'expense' },
  { id: '9', description: 'Rent', amount: 1350.00, category: 'Rent', date: '2024-12-08', type: 'expense' },
  { id: '10', description: 'In n out', amount: 13.56, category: 'Fast Food', date: '2024-12-07', type: 'expense' }
]

export default function App() {
  const [budgets, setBudgets] = useState<BudgetItem[]>(sampleBudgets)
  const [transactions, setTransactions] = useState<Transaction[]>(sampleTransactions)

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedBudgets = localStorage.getItem('budgets')
    const savedTransactions = localStorage.getItem('transactions')
    
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets))
    }
    
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions))
    }
  }, [])

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets))
  }, [budgets])

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions))
  }, [transactions])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2">EVA Budget</h1>
          <p className="text-muted-foreground">
            Manage your finances, track expenses, and achieve your savings goals
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="budgets" className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              Budgets
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Expenses
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <BudgetDashboard 
              budgets={budgets}
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
            />
          </TabsContent>

          <TabsContent value="budgets">
            <BudgetManager 
              budgets={budgets}
              onUpdateBudgets={setBudgets}
            />
          </TabsContent>

          <TabsContent value="expenses">
            <ExpenseTracker 
              transactions={transactions}
              budgets={budgets}
              onUpdateTransactions={setTransactions}
              onUpdateBudgets={setBudgets}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <BudgetAnalytics 
              transactions={transactions}
              budgets={budgets}
            />
          </TabsContent>
        </Tabs>

        {/* Getting Started Guide */}
        {budgets.length === 0 && transactions.length === 0 && (
          <Card className="p-8 mt-8 text-center">
            <h3 className="mb-4">Welcome to your Budget Tracker!</h3>
            <p className="text-muted-foreground mb-6">
              Get started by setting up your budget categories and adding your first transaction.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="p-4 border rounded-lg">
                <h4 className="mb-2">1. Set Up Budgets</h4>
                <p className="text-sm text-muted-foreground">
                  Create budget categories like groceries, entertainment, and utilities.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="mb-2">2. Track Expenses</h4>
                <p className="text-sm text-muted-foreground">
                  Add your income and expenses to see how you are doing against your budget.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="mb-2">3. Analyze Trends</h4>
                <p className="text-sm text-muted-foreground">
                  View charts and insights to understand your spending patterns.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}