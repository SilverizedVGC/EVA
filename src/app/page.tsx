'use client'
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { BudgetDashboard } from "@/components/BudgetDashboard"
import { BudgetManager } from "@/components/BudgetManager"
import { ExpenseTracker } from "@/components/ExpenseTracker"
import { BudgetAnalytics } from "@/components/BudgetAnalytics"
import { BarChart3, PlusCircle, DollarSign, TrendingUp } from "lucide-react"
import Transaction from "@/components/classes/Transaction"
import Category from "@/components/classes/Category"
import UserData from "@/components/classes/UserData"

const transaction1 = new Transaction('1', new Date('2024-12-15'), 85.50, 'expense', 'Chevron', 'Transportation');
const transaction2 = new Transaction('2', new Date('2024-12-14'), 40.00, 'expense', 'Game', 'Entertainment');
const transaction3 = new Transaction('2', new Date('2024-12-14'), 40.00, 'expense', 'Movie Theater', 'Entertainment');
const transaction4 = new Transaction('3', new Date('2024-12-13'), 1200.00, 'income', 'Salary', 'Income');

const category1 = new Category('0', new Date(), 'Income', '#ffffff', 0);
category1.addTransaction(transaction4);
const category2 = new Category('1', new Date(), 'Transportation', '#ef4444', 500);
category2.addTransaction(transaction1);
const category3 = new Category('2', new Date(), 'Entertainment', '#f97316', 200);
category3.addTransaction(transaction2);
category3.addTransaction(transaction3);
const sampleUserData = new UserData();
sampleUserData.setCategories([category1, category2, category3]);

export default function App() {
  const [userData, setUserData] = useState<UserData>(sampleUserData)
  const [newCategories, setNewCategories] = useState<Category[]>()

  // Load data from localStorage on mount
  // useEffect(() => {
  //   const savedBudgets = localStorage.getItem('budgets')
  //   const savedTransactions = localStorage.getItem('transactions')
    
  //   if (savedBudgets) {
  //     setBudgets(JSON.parse(savedBudgets))
  //   }
    
  //   if (savedTransactions) {
  //     setTransactions(JSON.parse(savedTransactions))
  //   }
  // }, [])

  // Save to localStorage when data changes
  // useEffect(() => {
  //   localStorage.setItem('budgets', JSON.stringify(budgets))
  // }, [budgets])

  // useEffect(() => {
  //   localStorage.setItem('transactions', JSON.stringify(transactions))
  // }, [transactions])

  useEffect(() => {
    if (newCategories) {
      const updatedUserData = new UserData()
      updatedUserData.setCategories(newCategories)
      setUserData(updatedUserData)
    }
  }, [newCategories])

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
              userData={userData}
            />
          </TabsContent>

          <TabsContent value="budgets">
            <BudgetManager 
              categories={userData.getCategories()}
              onUpdateBudgets={setNewCategories}
            />
          </TabsContent>

          {/* <TabsContent value="expenses">
            <ExpenseTracker 
              transactions={transactions}
              budgets={budgets}
              onUpdateTransactions={setTransactions}
              onUpdateBudgets={setBudgets}
            />
          </TabsContent> */}

          {/* <TabsContent value="analytics">
            <BudgetAnalytics 
              transactions={transactions}
              budgets={budgets}
            />
          </TabsContent> */}
        </Tabs>

        {/* Getting Started Guide */}
        {userData.getCategories().length === 0 && (
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