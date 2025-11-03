'use client'
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BudgetDashboard } from "@/components/BudgetDashboard"
import { BudgetManager } from "@/components/BudgetManager"
import { ExpenseTracker } from "@/components/ExpenseTracker"
import { BudgetAnalytics } from "@/components/BudgetAnalytics"
import { ThemeToggle } from "@/components/ThemeToggle"
import { BarChart3, PlusCircle, DollarSign, TrendingUp } from "lucide-react"
import Transaction from "@/components/classes/Transaction"
import Category from "@/components/classes/Category"
import UserData from "@/components/classes/UserData"

const transaction1 = new Transaction('1', new Date('2025-10-15'), 85.50, 'expense', 'Chevron', '1');
const transaction2 = new Transaction('2', new Date('2025-10-15'), 40.00, 'expense', 'Game', '2');
const transaction3 = new Transaction('3', new Date('2025-10-15'), 40.00, 'expense', 'Movie Theater', '2');
const transaction4 = new Transaction('4', new Date('2025-10-15'), 1200.00, 'income', 'Salary', '0');

const category1 = new Category('0', new Date(), 'Income', '#ffffff', 0);
const category2 = new Category('1', new Date(), 'Transportation', '#ef4444', 500);
const category3 = new Category('2', new Date(), 'Entertainment', '#f97316', 200);
const sampleUserData = new UserData();
sampleUserData.setCategories([category1, category2, category3]);
sampleUserData.setTransactions([transaction1, transaction2, transaction3, transaction4]);

export default function App() {
  const [logState, setLogState] = useState<boolean>(true)
  const [loogedIn, setLoggedIn] = useState<boolean>(false)
  const [userData, setUserData] = useState<UserData>(sampleUserData)
  const [categories, setCategories] = useState<Category[]>(userData.getCategories())
  const [transactions, setTransactions] = useState<Transaction[]>([transaction1, transaction2, transaction3, transaction4])
  const [monthYear, setMonthYear] = useState<string>(`${new Date().getMonth() + 1}-${new Date().getFullYear()}`) // month 1-12
  const [transactionsTabSearchQuery, setTransactionsTabSearchQuery] = useState<string>(`@date:${monthYear}`)

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

  const handleDeleteCategory = (id: string) => {
    const updatedTransactions = transactions.filter(transaction => transaction.getCategoryId() !== id)
    setTransactions(updatedTransactions)
  }

  const monthNumbertoName = (monthNumber: number): string => {
    const date = new Date()
    date.setMonth(monthNumber)
    return date.toLocaleString('default', { month: 'long' })
  }

  useEffect(() => {
    if (categories) {
      const updatedUserData = new UserData()
      updatedUserData.setCategories(categories)
      updatedUserData.setTransactions(transactions)
      setUserData(updatedUserData)
    }
  }, [categories, transactions])

  useEffect(() => {
    setTransactionsTabSearchQuery(`@date:${monthYear}`)
  }, [monthYear])

  return (
    <div className="min-h-screen bg-background">
      {!loogedIn ? (
        <div className="container mx-auto px-4 py-8 max-w-7xl flex justify-center items-center">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>{logState ? "Sign In to your account" : "Sign Up to your account"}</CardTitle>
              <CardDescription>
                {logState ? "Enter your email below to login to your account" : "Create your account by filling the details below"}
              </CardDescription>
              <CardAction>
                <Button variant="outline" onClick={() => setLogState(!logState)}>{logState ? "Sign Up" : "Sign In"}</Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <form>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                    </div>
                    <Input id="password" type="password" required />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button type="submit" className="w-full">
                {logState ? "Sign In" : "Sign Up"}
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setLoggedIn(true)}>
                Dev Pass
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-row items-center justify-between">
          <div className="mb-8">
            <h1 className="mb-2">EVA Budget</h1>
            <p className="text-muted-foreground">
              Manage your finances, track expenses, and achieve your savings goals
            </p>
          </div>
          <div className="border rounded-md border-foreground/10 w-fit p-2 mb-8 flex flex-row items-center">
            <h1 className="w-[200px]">Show for Month</h1>
            <Select value={monthYear} onValueChange={(value: string) => {
              setMonthYear(value)
            }}>
              <SelectTrigger className="">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 6 }, (_, index) => {
                  const month = new Date().getMonth() - index
                  const year = new Date().getFullYear()
                  return (
                    <SelectItem key={index} value={`${month + 1}-${year}`} onClick={() => setTransactionsTabSearchQuery(`@date:${month + 1}-${year}`)}>
                      {monthNumbertoName(month)} {year}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="mb-8">
            <ThemeToggle />
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-foreground/10">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <BudgetDashboard 
              userData={userData}
              monthYear={monthYear}
            />
          </TabsContent>

          <TabsContent value="categories">
            <BudgetManager 
              userData={userData}
              onUpdateCategories={setCategories}
              onDeleteCategory={(id: string) => handleDeleteCategory(id)}
              monthYear={monthYear}
            />
          </TabsContent>

          <TabsContent value="transactions">
            <ExpenseTracker 
              userData={userData}
              onUpdateTransactions={setTransactions}
              defaultSearchQuery={transactionsTabSearchQuery}
            />
          </TabsContent>

          {<TabsContent value="analytics">
            <BudgetAnalytics 
              userData={userData}
              monthYear={monthYear}
            />
          </TabsContent>}
        </Tabs>

        {/* Getting Started Guide */}
        {userData.getCategories().length === 1 && (
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
      )}
    </div>
  )
}