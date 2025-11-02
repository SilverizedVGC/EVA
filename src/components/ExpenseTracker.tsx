import { useEffect, useState } from "react"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuSubContent } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Calendar } from "./ui/calendar"
import { Badge } from "./ui/badge"
import { Plus, DollarSign, ChevronUp, ChevronDown, Upload, Funnel, Edit, Trash2 } from "lucide-react"
import { StatementImport } from "./StatementImport"
import UserData from "./classes/UserData"
import Transaction from "./classes/Transaction"

interface ExpenseTrackerProps {
  userData: UserData
  onUpdateTransactions: (transactions: Transaction[]) => void
  defaultSearchQuery?: string
}

type SortField = 'date' | 'description' | 'category' | 'type' | 'amount'
type SortDirection = 'asc' | 'desc'

export function ExpenseTracker({ userData, onUpdateTransactions, defaultSearchQuery }: ExpenseTrackerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [showImport, setShowImport] = useState(false)
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState<number | null>(null)
  const [categoryId, setCategoryId] = useState("")
  const [date, setDate] = useState(new Date())
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [formError, setFormError] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [searchQuery, setSearchQuery] = useState(defaultSearchQuery || '')

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

    if (!description) setFormError("Please enter a description")
    else if (!categoryId) setFormError("Please select a category")
    else if (!amount) setFormError("Please enter an amount")
    else if (amount <= 0) setFormError("Please enter an amount that is greater than zero")
    else if (!date) setFormError("Please select a date")
    else setFormError(null)
    
    if (!description || !categoryId || !amount || amount <= 0 || !date) return

    if (editingTransaction) {
      // Update existing transaction
      const updatedTransactions = userData.getTransactions().map(transaction =>
        transaction.getId() === editingTransaction.getId()
          ? new Transaction(
              transaction.getId(),
              new Date(date),
              amount,
              type,
              description,
              categoryId
            )
          : transaction
      )
      onUpdateTransactions(updatedTransactions)
    } else {
      // Add new transaction
      const newTransaction = new Transaction(
        userData.findMaxId(userData.getTransactions()) + 1 + "",
        new Date(date),
        amount,
        type,
        description,
        categoryId
      )
      onUpdateTransactions([...userData.getTransactions(), newTransaction])
    }

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
    setEditingTransaction(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (transaction: Transaction) => {
    setDate(new Date(transaction.getDate()))
    setAmount(transaction.getAmount())
    setType(transaction.getType())
    setDescription(transaction.getDescription())
    setCategoryId(transaction.getCategoryId())
    setEditingTransaction(transaction)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    const updatedTransactions = userData.getTransactions().filter(t => t.getId() !== id)
    onUpdateTransactions(updatedTransactions)
  }

  const resetForm = () => {
    setDate(new Date())
    setAmount(0)
    setType('expense')
    setDescription("")
    setCategoryId("")
    setEditingTransaction(null)
  }

  const getAvailableCategories = () => {
    if (type === 'expense') {
      return userData.getCategories().filter(category => category.getId() !== "0")
    } else {
      return userData.getCategories().filter(category => category.getId() === "0")
    }
  }

  useEffect(() => {
    if (type === 'income') {
      setCategoryId("0")
    } else {
      setCategoryId("")
    }
  }, [type])

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

  const getSearchFilteredTransactions = (transactions: Transaction[]) => {
    const query = searchQuery.toLowerCase().trim()
    if (query === "") return transactions

    return transactions.filter(transaction => {
      const descriptionMatch = transaction.getDescription().toLowerCase().includes(query)
      const category = userData.getCategoryById(transaction.getCategoryId())
      const categoryMatch = category ? category.getName().toLowerCase().includes(query.replace("@cat:", "").trim()) : false
      const typeMatch = transaction.getType().toLowerCase() === query.replace("@type:", "").trim()
      const {month, year} = userData.parseMonthYear(query.replace("@date:", "").trim())
      const dateMatch = transaction.getDate().getMonth() === month && transaction.getDate().getFullYear() === year

      return descriptionMatch || categoryMatch || typeMatch || dateMatch
    })
  }

  const getSortedTransactions = () => {
    return [...getSearchFilteredTransactions(userData.getTransactions())].sort((a, b) => {
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

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    setAmount(isNaN(value) ? null : value)
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
        <h2>Transaction Tracker</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowImport(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Import Statement
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={open => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTransaction ? "Edit" : "Add"} Transaction
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type" className="pb-2">Type</Label>
                  <Select value={type} onValueChange={(value: 'expense' | 'income') => {
                    setType(value)
                    setCategoryId("")
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
                  <Label htmlFor="amount" className="pb-2">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount ?? ""}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description" className="pb-2">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Grocery shopping, Gas bill"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category" className="pb-2">Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId} disabled={type === 'income'} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableCategories().map((category) => (
                      <SelectItem key={category.getId()} value={category.getId()}>
                        <div className="border-2 border-gray-300 rounded-full w-6 h-6 p-1" style={{ backgroundColor: category.getColor() }}></div>
                        {category.getName()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date" className="pb-2">Date</Label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="date"
                      className="w-48 justify-between font-normal"
                    >
                      {date ? date.toLocaleDateString() : "Select date"}
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      captionLayout="dropdown"
                      onSelect={(date) => {
                        setDate(date ?? new Date())
                        setIsCalendarOpen(false)
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="text-red-600">
                {formError}
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingTransaction ? "Save" : "Add"} Transaction
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

      <div className="grid gap-4">
        <div className="flex items-center justify-between gap-4 relative">
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions... (@cat:[name] for category search | @type:[expense/income] for type search | @date:[month-year] for date search)"
          />
          <div className="absolute right-8 top-1/4">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Funnel className="w-4 h-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSearchQuery(`@date:${new Date().getMonth() + 1}-${new Date().getFullYear()}`)}>Current Month</DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Categories</DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      {getAvailableCategories().map((category) => (
                        <DropdownMenuItem 
                          key={category.getId()} 
                          onClick={() => setSearchQuery(`@cat:${category.getName()}`)}
                        >
                          {category.getName()}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Type</DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => setSearchQuery('@type:expense')}>Expense</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSearchQuery('@type:income')}>Income</DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {getSortedTransactions().length} {getSortedTransactions().length === 1 ? "transaction" : "transactions"} total
        </div>
      </div>

      {/* All Transactions */}
      <div className="py-4">
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
                <TableHead 
                  className="text-right cursor-pointer hover:bg-muted/50 select-none"
                >
                  <div className="flex items-center justify-end gap-2">
                    
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransactions.map((transaction) => (
                <TableRow key={transaction.getId()}>
                  <TableCell>
                    <div className="flex items-center gap-2">
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
                  <TableCell className="flex items-center justify-center">
                    <div className="flex items-center justify-around">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(transaction)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(transaction.getId())}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}