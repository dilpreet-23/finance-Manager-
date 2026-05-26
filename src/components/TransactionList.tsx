import React, { useState } from 'react';
import { Transaction } from '../types';
import { formatCurrency, formatDate, convertAmount } from '../lib/utils';
import { 
  Trash2, 
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Download,
  FileText,
  Table as TableIcon,
  FileCode
} from 'lucide-react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, AlignmentType, HeadingLevel, TextRun } from 'docx';
import { saveAs } from 'file-saver';

interface Props {
  transactions: Transaction[];
  variant?: 'card' | 'list';
  showTitle?: boolean;
  displayCurrency: string;
}

export const TransactionList: React.FC<Props> = ({ transactions, variant = 'card', showTitle = true, displayCurrency }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const filteredTransactions = transactions.filter(t => 
    t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.amount.toString().includes(searchTerm)
  );

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Transaction History', 14, 15);
    
    const tableData = filteredTransactions.map(t => [
      formatDate(t.date),
      t.category,
      t.type.toUpperCase(),
      t.description || '-',
      `${t.type === 'income' ? '+' : '-'}${formatCurrency(convertAmount(t.amount, t.currency || 'USD', displayCurrency), displayCurrency)}`
    ]);

    autoTable(doc, {
      head: [['Date', 'Category', 'Type', 'Description', 'Amount']],
      body: tableData,
      startY: 20,
      theme: 'grid',
      headStyles: { fillColor: [10, 10, 10], textColor: [255, 255, 255] },
    });

    doc.save('transactions.pdf');
    setIsDownloadMenuOpen(false);
  };

  const exportToExcel = () => {
    const data = filteredTransactions.map(t => ({
      Date: formatDate(t.date),
      Category: t.category,
      Type: t.type,
      Description: t.description || '',
      Amount: `${t.type === 'income' ? '+' : '-'}${convertAmount(t.amount, t.currency || 'USD', displayCurrency).toFixed(2)}`,
      Currency: displayCurrency
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
    XLSX.writeFile(wb, 'transactions.xlsx');
    setIsDownloadMenuOpen(false);
  };

  const exportToWord = async () => {
    const tableRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Date", bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Category", bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Type", bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Amount", bold: true })] })] }),
        ],
      }),
      ...filteredTransactions.map(t => new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun(formatDate(t.date))] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun(t.category)] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun(t.type)] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun(`${t.type === 'income' ? '+' : '-'}${formatCurrency(convertAmount(t.amount, t.currency || 'USD', displayCurrency), displayCurrency)}`)] })] }),
        ],
      }))
    ];

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "Transaction History",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: "" }), // Spacer
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: tableRows,
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "transactions.docx");
    setIsDownloadMenuOpen(false);
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Category', 'Type', 'Description', 'Amount', 'Currency'];
    const rows = filteredTransactions.map(t => [
      formatDate(t.date),
      t.category,
      t.type,
      t.description || '',
      `${t.type === 'income' ? '+' : '-'}${convertAmount(t.amount, t.currency || 'USD', displayCurrency).toFixed(2)}`,
      displayCurrency
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, "transactions.csv");
    setIsDownloadMenuOpen(false);
  };

  return (
    <div className="space-y-12">
      {showTitle && (
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-2 text-left">
            <h3 className="text-3xl font-bold text-white font-sans tracking-tight">Transaction History</h3>
            <p className="text-base text-white/40 font-medium max-w-md">
              Manage and track your financial history with precision.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <div className="relative w-full sm:max-w-md group">
              <div className="absolute inset-0 bg-white/5 blur-xl rounded-full group-focus-within:bg-white/10 transition-all" />
              <div className="relative flex items-center">
                <Search className="absolute left-5 text-white/20 group-focus-within:text-white transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-white/20 transition-all text-sm text-white font-bold placeholder-white/10 shadow-xl"
                />
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setIsDownloadMenuOpen(!isDownloadMenuOpen)}
                className="flex items-center gap-3 px-6 py-4 bg-white text-[#0a0a0a] rounded-2xl font-bold text-sm shadow-xl hover:bg-white/90 transition-all active:scale-95"
              >
                <Download size={18} />
                <span>Export</span>
              </button>

              <AnimatePresence>
                {isDownloadMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsDownloadMenuOpen(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 mt-3 w-48 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-2 space-y-1">
                        <button
                          onClick={exportToPDF}
                          className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                          <FileText size={16} className="text-rose-400" />
                          PDF Document
                        </button>
                        <button
                          onClick={exportToExcel}
                          className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                          <TableIcon size={16} className="text-emerald-400" />
                          Excel Sheet
                        </button>
                        <button
                          onClick={exportToWord}
                          className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                          <FileText size={16} className="text-blue-400" />
                          Word Document
                        </button>
                        <button
                          onClick={exportToCSV}
                          className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                          <FileCode size={16} className="text-amber-400" />
                          CSV Data
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {filteredTransactions.length > 0 && (
          <div className="grid grid-cols-[60px_1fr_120px_120px_60px] px-8 py-4 text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] border-b border-white/5">
            <span></span>
            <span>Category</span>
            <span>Date</span>
            <span className="text-right">Amount</span>
            <span></span>
          </div>
        )}
        
        <AnimatePresence mode="popLayout">
          {filteredTransactions.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-32 bg-white/5 rounded-[40px] border-2 border-dashed border-white/10"
            >
              <p className="text-white/20 font-medium italic text-lg">
                {searchTerm ? 'No transactions match your search.' : 'No transactions yet. Start tracking your wealth.'}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((t) => (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`group p-4 rounded-2xl transition-all grid grid-cols-[60px_1fr_120px_120px_60px] items-center ${
                    variant === 'card' 
                      ? 'bg-white/5 hover:bg-white/10 shadow-xl border border-white/5' 
                      : 'bg-transparent hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${
                    t.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {t.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                  </div>

                  <div className="flex flex-col justify-center min-w-0 px-6">
                    <h4 className="font-bold text-white text-base truncate">{t.category}</h4>
                    {t.description && (
                      <p className="text-xs text-white/40 truncate font-medium mt-1">{t.description}</p>
                    )}
                  </div>
                  
                  <div className="text-sm font-bold text-white/40">
                    {formatDate(t.date)}
                  </div>

                  <div className="text-right">
                    <span className={`text-lg font-bold font-mono ${
                      t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(convertAmount(t.amount, t.currency || 'USD', displayCurrency), displayCurrency)}
                    </span>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => t.id && handleDelete(t.id)}
                      className="p-3 text-white/10 hover:text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
