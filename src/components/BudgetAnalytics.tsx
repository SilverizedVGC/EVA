import { Card } from "./ui/card"
import { Badge } from "./ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts"

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

interface BudgetAnalyticsProps {
  transactions: Transaction[]
  budgets: BudgetItem[]
}

export function BudgetAnalytics({ transactions, budgets }: BudgetAnalyticsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Prepare data for budget vs actual chart
  const budgetVsActualData = budgets.map(budget => ({
    category: budget.category,
    budgeted: budget.budgeted,
    spent: budget.spent,
    remaining: Math.max(0, budget.budgeted - budget.spent)
  }))

  // Prepare data for expense breakdown pie chart
  const expenseData = budgets
    .filter(budget => budget.spent > 0)
    .map(budget => ({
      name: budget.category,
      value: budget.spent,
      color: budget.color
    }))

  // Calculate monthly trends
  const getMonthlyTrends = () => {
    const monthlyData: { [key: string]: { income: number, expenses: number } } = {}
    
    transactions.forEach(transaction => {
      const monthKey = new Date(transaction.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      })
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 }
      }
      
      if (transaction.type === 'income') {
        monthlyData[monthKey].income += transaction.amount
      } else {
        monthlyData[monthKey].expenses += transaction.amount
      }
    })

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        income: data.income,
        expenses: data.expenses,
        savings: data.income - data.expenses
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-6) // Last 6 months
  }

  const monthlyTrends = getMonthlyTrends()

  // Calculate spending insights
  const getSpendingInsights = () => {
    const insights = []
    
    // Check for over-budget categories
    const overBudgetCategories = budgets.filter(budget => budget.spent > budget.budgeted)
    if (overBudgetCategories.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Over Budget Alert',
        message: `${overBudgetCategories.length} categories are over budget`
      })
    }

    // Check for high spending category
    const highestSpending = budgets.reduce((max, budget) => 
      budget.spent > max.spent ? budget : max, budgets[0] || { spent: 0, category: '' }
    )
    
    if (highestSpending.spent > 0) {
      insights.push({
        type: 'info',
        title: 'Highest Spending',
        message: `${highestSpending.category}: ${formatCurrency(highestSpending.spent)}`
      })
    }

    // Check savings rate
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0
    
    if (savingsRate < 10) {
      insights.push({
        type: 'warning',
        title: 'Low Savings Rate',
        message: `Consider increasing savings to at least 10%`
      })
    } else if (savingsRate >= 20) {
      insights.push({
        type: 'success',
        title: 'Great Savings Rate',
        message: `You're saving ${savingsRate.toFixed(1)}% of your income`
      })
    }

    return insights
  }

  const insights = getSpendingInsights()

  return (
    <div className="space-y-6">
      <h2>Budget Analytics</h2>

      {/* Insights */}
      {insights.length > 0 && (
        <Card className="p-6">
          <h3 className="mb-4">Insights</h3>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3">
                <Badge 
                  variant={
                    insight.type === 'warning' ? 'destructive' : 
                    insight.type === 'success' ? 'default' : 'secondary'
                  }
                >
                  {insight.type}
                </Badge>
                <div>
                  <h4>{insight.title}</h4>
                  <p className="text-sm text-muted-foreground">{insight.message}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Budget vs Actual */}
      <Card className="p-6">
        <h3 className="mb-4">Budget vs Actual Spending</h3>
        {budgetVsActualData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={budgetVsActualData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="budgeted" fill="#e2e8f0" name="Budgeted" />
              <Bar dataKey="spent" fill="#3b82f6" name="Spent" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <p>No budget data available yet.</p>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown */}
        <Card className="p-6">
          <h3 className="mb-4">Expense Breakdown</h3>
          {expenseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p>No expense data available yet.</p>
            </div>
          )}
        </Card>

        {/* Monthly Trends */}
        <Card className="p-6">
          <h3 className="mb-4">Monthly Trends</h3>
          {monthlyTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="income" stroke="#22c55e" name="Income" />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" name="Expenses" />
                <Line type="monotone" dataKey="savings" stroke="#3b82f6" name="Savings" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p>No trend data available yet.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}