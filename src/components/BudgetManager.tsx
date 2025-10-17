import { useState } from "react"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Plus, Edit, Trash2 } from "lucide-react"

interface BudgetItem {
  id: string
  category: string
  budgeted: number
  spent: number
  color: string
}

interface BudgetManagerProps {
  budgets: BudgetItem[]
  onUpdateBudgets: (budgets: BudgetItem[]) => void
}

const defaultColors = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", 
  "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
  "#f59e0b", "#10b981"
]

export function BudgetManager({ budgets, onUpdateBudgets }: BudgetManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<BudgetItem | null>(null)
  const [category, setCategory] = useState("")
  const [amount, setAmount] = useState("")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!category || !amount) return

    const budgetAmount = parseFloat(amount)
    if (isNaN(budgetAmount) || budgetAmount <= 0) return

    if (editingBudget) {
      // Update existing budget
      const updatedBudgets = budgets.map(budget =>
        budget.id === editingBudget.id
          ? { ...budget, category, budgeted: budgetAmount }
          : budget
      )
      onUpdateBudgets(updatedBudgets)
    } else {
      // Add new budget
      const colorIndex = budgets.length % defaultColors.length
      const newBudget: BudgetItem = {
        id: Date.now().toString(),
        category,
        budgeted: budgetAmount,
        spent: 0,
        color: defaultColors[colorIndex]
      }
      onUpdateBudgets([...budgets, newBudget])
    }

    // Reset form
    setCategory("")
    setAmount("")
    setEditingBudget(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (budget: BudgetItem) => {
    setEditingBudget(budget)
    setCategory(budget.category)
    setAmount(budget.budgeted.toString())
    setIsDialogOpen(true)
  }

  const handleDelete = (budgetId: string) => {
    const updatedBudgets = budgets.filter(budget => budget.id !== budgetId)
    onUpdateBudgets(updatedBudgets)
  }

  const resetForm = () => {
    setCategory("")
    setAmount("")
    setEditingBudget(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2>Budget Categories</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open: boolean) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingBudget ? "Edit Budget Category" : "Add Budget Category"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="category">Category Name</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Groceries, Entertainment"
                  required
                />
              </div>
              <div>
                <Label htmlFor="amount">Monthly Budget</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingBudget ? "Update" : "Add"} Category
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {budgets.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            <p>No budget categories yet.</p>
            <p>Add your first category to get started!</p>
          </Card>
        ) : (
          budgets.map((budget) => {
            const percentage = budget.budgeted > 0 ? (budget.spent / budget.budgeted) * 100 : 0
            const remaining = budget.budgeted - budget.spent
            
            return (
              <Card key={budget.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: budget.color }}
                    />
                    <div>
                      <h4>{budget.category}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(budget.spent)} of {formatCurrency(budget.budgeted)} spent
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className={remaining >= 0 ? "text-green-600" : "text-red-600"}>
                        {formatCurrency(remaining)} remaining
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {percentage.toFixed(1)}% used
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(budget)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(budget.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}