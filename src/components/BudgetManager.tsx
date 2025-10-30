import { useState } from "react"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Plus, Edit, Trash2 } from "lucide-react"
import UserData from "./classes/UserData"
import Category from "./classes/Category"

interface BudgetManagerProps {
  userData: UserData
  onUpdateCategories: (categories: Category[]) => void
  onDeleteCategory?: (id: string) => void
}

export function BudgetManager({ userData, onUpdateCategories, onDeleteCategory }: BudgetManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  //const [dialogMode, setDialogMode] = useState<"edit" | "delete">("edit")
  const [editingBudget, setEditingBudget] = useState<Category | null>(null)
  const [name, setName] = useState("")
  const [color, setColor] = useState("")
  const [budget, setBudget] = useState<number | null>(null)
  const [type, setType] = useState<'name' | 'date'>('name')
  const [formError, setFormError] = useState<string | null>(null)

  const colorOptions = [
    { name: "Red", label: "#ef4444" },
    { name: "Orange", label: "#f97316" },
    { name: "Yellow", label: "#eab308" },
    { name: "Green", label: "#22c55e" },
    { name: "Teal", label: "#06b6d4" },
    { name: "Blue", label: "#3b82f6" },
    { name: "Purple", label: "#8b5cf6" },
    { name: "Pink", label: "#ec4899" },
    { name: "Amber", label: "#f59e0b" },
    { name: "Emerald", label: "#10b981" }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name) setFormError("Please enter a category name")
    else if (!color) setFormError("Please select a color")
    else if (budget == null) setFormError("Please enter a budget")
    else if (budget <= 0) setFormError("Please enter a budget that is greater than zero")
    else setFormError(null)
    
    if (!name || !color || !budget || budget <= 0) return

    if (editingBudget) {
      // Update existing category
      const updatedCategories = userData.getCategories().map(category =>
        category.getId() === editingBudget.getId()
          ? new Category(
              category.getId(),
              category.getDate(),
              name,
              color,
              budget
            )
          : category
      )
      onUpdateCategories(updatedCategories)
    } else {
      // Add new category
      const newCategory = new Category(
        Date.now().toString(),
        new Date(),
        name,
        color,
        budget
      )
      onUpdateCategories([...userData.getCategories(), newCategory])
    }

    // Reset form
    setName("")
    setColor("")
    setBudget(0)
    setEditingBudget(null)
    setIsDialogOpen(false)
  }

  const handleEdit = ([category, name, color, budget]: [category: Category, name: string, color: string, budget: number]) => {
    setEditingBudget(category)
    setName(name)
    setColor(color)
    setBudget(budget)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    const updatedBudgets = userData.getCategories().filter(category => category.getId() !== id)
    onUpdateCategories(updatedBudgets)
    if (onDeleteCategory) onDeleteCategory(id)
  }

  const resetForm = () => {
    setName("")
    setColor("")
    setBudget(0)
    setEditingBudget(null)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    setBudget(isNaN(value) ? null : value)
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
                <Label htmlFor="category" className="pb-2">Category Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Groceries, Entertainment"
                  required
                />
              </div>
              <div>
                <Label className="pb-2">Category Color</Label>
                <RadioGroup defaultValue={color} className="grid grid-cols-2">
                  {colorOptions.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <RadioGroupItem
                        value={option.label}
                        id={option.name}
                        checked={color === option.label}
                        onClick={() => setColor(option.label)}
                        className="border-2 border-gray-300 rounded-full w-6 h-6 p-1"
                        style={{ backgroundColor: option.label }}
                      >
                      </RadioGroupItem>
                      <Label htmlFor={option.name}>{option.name}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div>
                <Label htmlFor="amount" className="pb-2">Monthly Budget</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={budget ?? ""}
                  onChange={handleAmountChange}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="text-red-600">
                {formError}
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
        <div className="flex items-center justify-between gap-4">
          <Input
            type="search"
            placeholder="Search categories..."
          />
          <Select value={type} onValueChange={(value: 'name' | 'date') => {
            setType(value)
          }}>
            <SelectTrigger className="w-[30%]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="date">Sort by Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">
          {userData.getCategories().length - 1} {userData.getCategories().length === 1 ? "category" : "categories"} total
        </div>
      </div>

      <div className="grid gap-4">
        {userData.getCategories().length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            <p>No budget categories yet.</p>
            <p>Add your first category to get started!</p>
          </Card>
        ) : (
          userData.getCategories().map((category) => {
            if (category.getId() === "0") return null // Skip default category
            const percentage = userData.calculateUsage(category.getId())
            const remaining = userData.calculateRemainingBudget(category.getId())
            
            return (
              <Card key={category.getId()} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.getColor() }}
                    />
                    <div>
                      <h4>{category.getName()}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(userData.calculateExpense(category.getId()))} of {formatCurrency(category.getBudget())} spent
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
                        onClick={() => handleEdit([category, category.getName(), category.getColor(), category.getBudget()])}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category.getId())}
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