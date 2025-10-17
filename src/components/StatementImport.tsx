import { useState } from "react"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Badge } from "./ui/badge"
import { Checkbox } from "./ui/checkbox"
import { Upload, FileText, ArrowLeft, Check, X } from "lucide-react"

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

interface ParsedTransaction {
  id: string
  date: string
  description: string
  amount: number
  suggestedCategory: string
  type: 'expense' | 'income'
  selected: boolean
}

interface StatementImportProps {
  budgets: BudgetItem[]
  onBack: () => void
  onImportTransactions: (transactions: Transaction[]) => void
}

// Mock parsed data from a bank statement
const mockParsedData: ParsedTransaction[] = [
  { id: '1', date: '2024-12-15', description: 'WHOLE FOODS MARKET #10342', amount: 87.45, suggestedCategory: 'Groceries', type: 'expense', selected: true },
  { id: '2', date: '2024-12-14', description: 'SHELL GAS STATION', amount: 52.30, suggestedCategory: 'Transportation', type: 'expense', selected: true },
  { id: '3', date: '2024-12-13', description: 'NETFLIX.COM', amount: 15.99, suggestedCategory: 'Entertainment', type: 'expense', selected: true },
  { id: '4', date: '2024-12-12', description: 'PAYROLL DEPOSIT - ACME CORP', amount: 3500.00, suggestedCategory: 'Salary', type: 'income', selected: true },
  { id: '5', date: '2024-12-11', description: 'STARBUCKS STORE #2847', amount: 6.75, suggestedCategory: 'Fast Food', type: 'expense', selected: true },
  { id: '6', date: '2024-12-10', description: 'AMAZON.COM PURCHASE', amount: 124.99, suggestedCategory: 'Misc.', type: 'expense', selected: true },
  { id: '7', date: '2024-12-09', description: 'UBER TRIP', amount: 18.50, suggestedCategory: 'Transportation', type: 'expense', selected: true },
  { id: '8', date: '2024-12-08', description: 'ATM WITHDRAWAL FEE', amount: 3.50, suggestedCategory: 'Misc.', type: 'expense', selected: false },
  { id: '9', date: '2024-12-07', description: 'TARGET STORE T-1842', amount: 45.20, suggestedCategory: 'Misc.', type: 'expense', selected: true },
  { id: '10', date: '2024-12-06', description: 'ELECTRIC COMPANY AUTOPAY', amount: 89.12, suggestedCategory: 'Rent', type: 'expense', selected: true }
]

export function StatementImport({ budgets, onBack, onImportTransactions }: StatementImportProps) {
  const [uploadStep, setUploadStep] = useState<'upload' | 'review'>('upload')
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
    }
  }

  const handleProcessFile = () => {
    if (!selectedFile) return
    
    setIsProcessing(true)
    // Simulate processing time
    setTimeout(() => {
      setParsedTransactions(mockParsedData)
      setUploadStep('review')
      setIsProcessing(false)
    }, 2000)
  }

  const handleTransactionToggle = (id: string, checked: boolean) => {
    setParsedTransactions(transactions =>
      transactions.map(t =>
        t.id === id ? { ...t, selected: checked } : t
      )
    )
  }

  const handleCategoryChange = (id: string, category: string) => {
    setParsedTransactions(transactions =>
      transactions.map(t =>
        t.id === id ? { ...t, suggestedCategory: category } : t
      )
    )
  }

  const handleImport = () => {
    const selectedTransactions = parsedTransactions
      .filter(t => t.selected)
      .map(t => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        description: t.description,
        amount: t.amount,
        category: t.suggestedCategory,
        date: t.date,
        type: t.type as 'expense' | 'income'
      }))

    onImportTransactions(selectedTransactions)
    onBack()
  }

  const getAvailableCategories = (type: 'expense' | 'income') => {
    if (type === 'expense') {
      return budgets.map(budget => budget.category)
    } else {
      return ['Salary', 'Freelance', 'Business', 'Investments', 'Other']
    }
  }

  const selectedCount = parsedTransactions.filter(t => t.selected).length
  const totalAmount = parsedTransactions
    .filter(t => t.selected)
    .reduce((sum, t) => sum + (t.type === 'expense' ? t.amount : -t.amount), 0)

  if (uploadStep === 'upload') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Expenses
          </Button>
          <div>
            <h2>Import Bank Statement</h2>
            <p className="text-muted-foreground">Upload a PDF bank statement to automatically import transactions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card className="p-6">
            <h3 className="mb-4">Upload Statement</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <div className="space-y-2">
                  <p>Drag and drop your PDF statement here, or</p>
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-primary underline">browse to select a file</span>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Supported format: PDF (Max 10MB)
                </p>
              </div>

              {selectedFile && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <Button 
                onClick={handleProcessFile}
                disabled={!selectedFile || isProcessing}
                className="w-full"
              >
                {isProcessing ? "Processing..." : "Process Statement"}
              </Button>
            </div>
          </Card>

          {/* Instructions */}
          <Card className="p-6">
            <h3 className="mb-4">Instructions</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm mt-0.5">1</div>
                <div>
                  <h4>Download Your Statement</h4>
                  <p className="text-sm text-muted-foreground">
                    Log into your bank website and download a PDF statement for the desired period.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm mt-0.5">2</div>
                <div>
                  <h4>Upload the PDF</h4>
                  <p className="text-sm text-muted-foreground">
                    Upload your statement PDF using the upload area.
                    Optional: Redact any personal identifiers or sensitive data.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm mt-0.5">3</div>
                <div>
                  <h4>Review & Import</h4>
                  <p className="text-sm text-muted-foreground">
                    Review the extracted transactions, adjust categories if needed, and import to your budget.
                  </p>
                </div>
              </div>
            </div>
            
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Expenses
          </Button>
          <div>
            <h2>Review Imported Transactions</h2>
            <p className="text-muted-foreground">
              {selectedCount} of {parsedTransactions.length} transactions selected
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Impact</p>
            <p className={totalAmount >= 0 ? "text-red-600" : "text-green-600"}>
              {totalAmount >= 0 ? '+' : ''}{formatCurrency(Math.abs(totalAmount))}
            </p>
          </div>
          <Button onClick={handleImport} disabled={selectedCount === 0}>
            <Check className="w-4 h-4 mr-2" />
            Import {selectedCount} Transaction{selectedCount !== 1 ? 's' : ''}
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3>Parsed Transactions</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setParsedTransactions(transactions =>
                  transactions.map(t => ({ ...t, selected: true }))
                )
              }}
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setParsedTransactions(transactions =>
                  transactions.map(t => ({ ...t, selected: false }))
                )
              }}
            >
              Select None
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parsedTransactions.map((transaction) => (
              <TableRow key={transaction.id} className={!transaction.selected ? "opacity-50" : ""}>
                <TableCell>
                  <Checkbox
                    checked={transaction.selected}
                    onCheckedChange={(checked: boolean) => 
                      handleTransactionToggle(transaction.id, checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell>{formatDate(transaction.date)}</TableCell>
                <TableCell>
                  <div className="max-w-xs truncate" title={transaction.description}>
                    {transaction.description}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={transaction.type === 'income' ? 'default' : 'secondary'}
                  >
                    {transaction.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Select 
                    value={transaction.suggestedCategory}
                    onValueChange={(value: string) => handleCategoryChange(transaction.id, value)}
                    disabled={!transaction.selected}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableCategories(transaction.type).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}