import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import TransactionForm from "@/components/transaction-form";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showTransactionForm, setShowTransactionForm] = useState(false);

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["/api/transactions"],
    retry: false,
  });

  // Get current month info
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Calculate calendar days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const calendarDays = [];
  
  // Previous month's days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const prevDate = new Date(year, month, -i);
    calendarDays.push({
      date: prevDate.getDate(),
      isCurrentMonth: false,
      fullDate: prevDate.toISOString().split('T')[0],
    });
  }

  // Current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    calendarDays.push({
      date: day,
      isCurrentMonth: true,
      fullDate: date.toISOString().split('T')[0],
    });
  }

  // Next month's days to fill the grid
  const remainingSlots = 42 - calendarDays.length; // 6 weeks * 7 days
  for (let day = 1; day <= remainingSlots; day++) {
    const nextDate = new Date(year, month + 1, day);
    calendarDays.push({
      date: day,
      isCurrentMonth: false,
      fullDate: nextDate.toISOString().split('T')[0],
    });
  }

  // Get transactions for a specific date
  const getTransactionsForDate = (dateStr: string) => {
    return transactions?.filter((t: any) => t.date === dateStr) || [];
  };

  // Check if date has events
  const hasEvents = (dateStr: string) => {
    return getTransactionsForDate(dateStr).length > 0;
  };

  // Get today's date string
  const today = new Date().toISOString().split('T')[0];
  const todayTransactions = getTransactionsForDate(today);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(month - 1);
    } else {
      newDate.setMonth(month + 1);
    }
    setCurrentDate(newDate);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-primary rounded-3xl mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Financial Calendar</h2>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl bg-accent"
            data-testid="button-calendar-options"
          >
            <i className="fas fa-calendar-alt text-accent-foreground"></i>
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth('prev')}
            data-testid="button-previous-month"
          >
            <i className="fas fa-chevron-left text-muted-foreground"></i>
          </Button>
          <h3 className="font-semibold" data-testid="text-current-month">
            {monthNames[month]} {year}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth('next')}
            data-testid="button-next-month"
          >
            <i className="fas fa-chevron-right text-muted-foreground"></i>
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-center text-muted-foreground text-sm font-medium py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1 mb-6">
          {calendarDays.map((day, index) => (
            <button
              key={index}
              className={`
                aspect-square rounded-lg flex items-center justify-center cursor-pointer transition-all text-sm
                ${!day.isCurrentMonth ? 'text-muted-foreground' : ''}
                ${hasEvents(day.fullDate) ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}
                ${day.fullDate === today ? 'ring-2 ring-primary' : ''}
              `}
              onClick={() => setSelectedDate(day.fullDate)}
              data-testid={`calendar-day-${day.fullDate}`}
            >
              {day.date}
            </button>
          ))}
        </div>

        {/* Today's Events */}
        <Card className="mb-20">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-4">Today's Transactions</h4>
            <div className="space-y-3">
              {todayTransactions.length > 0 ? (
                todayTransactions.map((transaction: any) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-accent rounded-xl"
                    data-testid={`transaction-${transaction.id}`}
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                        transaction.type === 'income' 
                          ? 'bg-green-100 dark:bg-green-900/20' 
                          : 'bg-red-100 dark:bg-red-900/20'
                      }`}>
                        <i className={`fas ${
                          transaction.type === 'income' ? 'fa-plus text-green-500' : 'fa-minus text-red-500'
                        } text-sm`}></i>
                      </div>
                      <div>
                        <p className="font-medium text-sm" data-testid={`transaction-description-${transaction.id}`}>
                          {transaction.description}
                        </p>
                        <p className="text-muted-foreground text-xs" data-testid={`transaction-time-${transaction.id}`}>
                          {transaction.category || 'Uncategorized'}
                        </p>
                      </div>
                    </div>
                    <p className={`font-semibold ${
                      transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                    }`} data-testid={`transaction-amount-${transaction.id}`}>
                      {transaction.type === 'income' ? '+' : '-'}${parseFloat(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4" data-testid="text-no-transactions">
                  No transactions today
                </p>
              )}
            </div>
            
            <Button
              className="w-full mt-4 h-12 rounded-xl font-medium"
              onClick={() => setShowTransactionForm(true)}
              data-testid="button-add-transaction"
            >
              Add New Transaction
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Form Dialog */}
      <Dialog open={showTransactionForm} onOpenChange={setShowTransactionForm}>
        <DialogContent className="max-w-md mx-auto">
          <TransactionForm
            type="expense"
            onClose={() => setShowTransactionForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
