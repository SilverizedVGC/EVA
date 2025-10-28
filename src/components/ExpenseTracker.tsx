import { useState } from "react"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Badge } from "./ui/badge"
import { Plus, Calendar, DollarSign, ChevronUp, ChevronDown, Upload } from "lucide-react"
import { StatementImport } from "./StatementImport"
import UserData from "./classes/UserData"
import Transaction from "./classes/Transaction"

interface ExpenseTrackerProps {
  userData: UserData
  onUpdateTransactions: (transactions: Transaction[]) => void
}

type SortField = 'date' | 'description' | 'category' | 'type' | 'amount'
type SortDirection = 'asc' | 'desc'

export function ExpenseTracker({ userData, onUpdateTransactions }: ExpenseTrackerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState(0)
  const [categoryId, setCategoryId] = useState("")
  const [date, setDate] = useState(new Date())
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!description || !categoryId || !amount || !date) return
    if (amount <= 0) return

    const newTransaction = new Transaction(
      Date.now().toString(),
      new Date(date),
      amount,
      type,
      description,
      categoryId
    )

    onUpdateTransactions([...userData.getTransactions(), newTransaction])

    // Update budget spent amount if it's an expense
    // if (type === 'expense') {
    //   const updatedBudgets = budgets.map(budget =>
    //     budget.category === category
    //       ? { ...budget, spent: budget.spent + transactionAmount }
    //       : budget
    //   )
    //   onUpdateBudgets(updatedBudgets)
    // }

    // Reset form
    setDate(new Date())
    setAmount(0)
    setDescription("")
    setCategoryId("")
    setType('expense')
    setIsDialogOpen(false)
  }

  const getAvailableCategories = () => {
    if (type === 'expense') {
      return userData.getCategories().map(category => category.getName())
    } else {
      return []
    }
  }

  // const checkTransactions = (): boolean => {
  //   const newTransactions = userData.getTransactions().filter(transaction => userData.getCategoryById(transaction.getCategoryId()) !== undefined)
  //   onUpdateTransactions(newTransactions)
  //   return true
  // }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // If same field, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // If different field, set new field and default to asc
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortedTransactions = () => {
    return [...userData.getTransactions()].sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case 'date':
          aValue = new Date(a.getDate()).getTime()
          bValue = new Date(b.getDate()).getTime()
          break
        case 'description':
          aValue = a.getDescription().toLowerCase()
          bValue = b.getDescription().toLowerCase()
          break
        case 'category':
          aValue = a.getCategoryId().toLowerCase()
          bValue = b.getCategoryId().toLowerCase()
          break
        case 'type':
          aValue = a.getType()
          bValue = b.getType()
          break
        case 'amount':
          aValue = a.getAmount()
          bValue = b.getAmount()
          break
        default:
          return 0
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1
      }
      return 0
    })
  }

  const sortedTransactions = getSortedTransactions()

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <div className="w-4 h-4" /> // Empty space to maintain alignment
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />
  }

  // const handleImportTransactions = (importedTransactions: Transaction[]) => {
  //   // Add imported transactions to existing transactions
  //   onUpdateTransactions([...transactions, ...importedTransactions])

  //   // Update budget spent amounts for expenses
  //   const updatedBudgets = [...budgets]
  //   importedTransactions.forEach(transaction => {
  //     if (transaction.type === 'expense') {
  //       const budgetIndex = updatedBudgets.findIndex(budget => budget.category === transaction.category)
  //       if (budgetIndex !== -1) {
  //         updatedBudgets[budgetIndex] = {
  //           ...updatedBudgets[budgetIndex],
  //           spent: updatedBudgets[budgetIndex].spent + transaction.amount
  //         }
  //       }
  //     }
  //   })
  //   onUpdateBudgets(updatedBudgets)
  // }

  // if (showImport) {
  //   return (
  //     <StatementImport
  //       budgets={budgets}
  //       onBack={() => setShowImport(false)}
  //       onImportTransactions={handleImportTransactions}
  //     />
  //   )
  // }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2>Expense Tracker</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowImport(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Import Statement
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Transaction</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={type} onValueChange={(value: 'expense' | 'income') => {
                    setType(value)
                    setCategoryId("") // Reset category when type changes
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Grocery shopping, Gas bill"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableCategories().map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date.toDateString()}
                  onChange={(e) => setDate(new Date(e.target.value))}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Add Transaction
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
      </div>

      {/* All Transactions */}
      <Card className="p-6">
        <h3 className="mb-4">All Transactions ({userData.getTransactions().length})</h3>
        {sortedTransactions.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No transactions yet.</p>
            <p>Add your first transaction to get started!</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-2">
                    Date
                    <SortIcon field="date" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort('description')}
                >
                  <div className="flex items-center gap-2">
                    Description
                    <SortIcon field="description" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center gap-2">
                    Category
                    <SortIcon field="category" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center gap-2">
                    Type
                    <SortIcon field="type" />
                  </div>
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Amount
                    <SortIcon field="amount" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransactions.map((transaction) => (
                <TableRow key={transaction.getId()}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {formatDate(transaction.getDate().toString())}
                    </div>
                  </TableCell>
                  <TableCell>{transaction.getDescription()}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {userData.getCategoryById(transaction.getCategoryId())?.getName()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={transaction.getType() === 'income' ? 'default' : 'secondary'}
                    >
                      {transaction.getType()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={transaction.getType() === 'income' ? 'text-green-600' : 'text-red-600'}>
                      {transaction.getType() === 'income' ? '+' : '-'}{formatCurrency(transaction.getAmount())}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}