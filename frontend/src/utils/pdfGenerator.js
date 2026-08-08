import { jsPDF } from 'jspdf';

const formatPDFRupees = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return 'Rs. 0.00';
  return 'Rs. ' + new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Generates a clean, professional PDF report of student expenses and budget statistics.
 * @param {Object} user - Current user object
 * @param {Object} analyticsData - Core analytics API data response
 * @param {Array} expenses - List of user expenses
 */
const generatePDFReport = (user, analyticsData, expenses = []) => {
  const doc = new jsPDF();
  const dateStr = new Date().toLocaleDateString();

  // Helper for drawing separators
  const drawLine = (y) => {
    doc.setDrawColor(226, 232, 240); // #e2e8f0 border color
    doc.setLineWidth(0.5);
    doc.line(14, y, 196, y);
  };

  // --- PAGE 1: EXECUTIVE FINANCE SUMMARY ---

  // Header section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(30, 136, 229); // Primary blue
  doc.text('🎓 Student Expense Tracker', 14, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(90, 108, 125); // Body slate color
  doc.text(`Generated on: ${dateStr}`, 142, 16);
  doc.text(`Student Name: ${user.name}`, 142, 21);
  doc.text(`Student Email: ${user.email}`, 142, 26);

  drawLine(32);

  // Report title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(44, 62, 80); // Dark neutral
  doc.text('Monthly Financial Report & Spending Insights', 14, 42);

  // Stats Grid - Box 1: Spent
  doc.setDrawColor(30, 136, 229);
  doc.setFillColor(248, 250, 254);
  doc.roundedRect(14, 50, 85, 30, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 136, 229);
  doc.text('TOTAL MONTHLY SPENT', 18, 57);
  doc.setFontSize(16);
  doc.setTextColor(44, 62, 80);
  doc.text(formatPDFRupees(analyticsData.summary.totalSpent), 18, 70);

  // Stats Grid - Box 2: Budget
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(111, 50, 85, 30, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(90, 108, 125);
  doc.text('MONTHLY BUDGET TARGET', 115, 57);
  doc.setFontSize(16);
  doc.setTextColor(44, 62, 80);
  const budgetLimit = analyticsData.summary.budgetLimit;
  doc.text(budgetLimit > 0 ? formatPDFRupees(budgetLimit) : 'Not Set', 115, 70);

  // Stats Grid - Box 3: Remaining

  const remaining = analyticsData.summary.remainingBudget;

  const isOver =
    budgetLimit > 0 &&
    analyticsData.summary.totalSpent > budgetLimit;


  // Set Colors

  if (isOver) {

    doc.setDrawColor(198, 40, 40);

    doc.setFillColor(255, 235, 235);

    doc.setTextColor(198, 40, 40);

  } else {

    doc.setDrawColor(46, 125, 50);

    doc.setFillColor(232, 245, 233);

    doc.setTextColor(46, 125, 50);
  }


  doc.roundedRect(14, 90, 85, 30, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');

  doc.setFontSize(9);

  doc.text(
    isOver ? 'BUDGET OVERSPENT' : 'REMAINING BALANCE',
    18,
    97
  );


  doc.setFontSize(16);

  doc.setTextColor(44, 62, 80);

  doc.text(
    isOver
      ? `-${formatPDFRupees(analyticsData.summary.totalSpent - budgetLimit)}`
      : formatPDFRupees(remaining),
    18,
    110
  );

  // Stats Grid - Box 4: Top Category
  doc.setDrawColor(245, 124, 0); // Amber
  doc.setFillColor(255, 243, 224);
  doc.roundedRect(111, 90, 85, 30, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(245, 124, 0);
  doc.text('TOP SPENDING CATEGORY', 115, 97);
  doc.setFontSize(14);
  doc.setTextColor(44, 62, 80);
  doc.text(analyticsData.summary.topCategory, 115, 107);
  doc.setFontSize(9);
  doc.setTextColor(90, 108, 125);
  doc.text(`Spent: ${formatPDFRupees(analyticsData.summary.topCategoryAmount)}`, 115, 114);

  drawLine(132);

  // Section: Monthly Trends List
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(44, 62, 80);
  doc.text('Historical Spending Trends (Last 6 Months)', 14, 142);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(90, 108, 125);

  let trendY = 152;
  analyticsData.monthlyTrends.forEach(trend => {
    doc.setFont('helvetica', 'bold');
    doc.text(trend.label, 16, trendY);
    doc.setFont('helvetica', 'normal');
    doc.text(`Spent: ${formatPDFRupees(trend.amount)}`, 80, trendY);

    // Draw visual progress bar
    doc.setFillColor(241, 245, 249);
    doc.rect(120, trendY - 3, 50, 4, 'F');
    const maxBarVal = Math.max(...analyticsData.monthlyTrends.map(t => t.amount), 500);
    const barWidth = Math.min(50, (trend.amount / maxBarVal) * 50);
    doc.setFillColor(30, 136, 229);
    if (barWidth > 0) doc.rect(120, trendY - 3, barWidth, 4, 'F');

    trendY += 8;
  });

  drawLine(trendY + 4);

  // Section: Recommendations
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(44, 62, 80);
  doc.text('Smart Spending Advisor Recommendations', 14, trendY + 12);

  let sugY = trendY + 22;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(44, 62, 80);

  analyticsData.suggestions.forEach(sug => {
    const splitText = doc.splitTextToSize(`* ${sug}`, 175);
    splitText.forEach(line => {
      if (sugY < 285) {
        doc.text(line, 16, sugY);
        sugY += 5;
      }
    });
    sugY += 3;
  });

  // Page 1 Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Student Expense Tracker App • Powered by React & Express', 14, 290);
  doc.text('Page 1 of 2', 182, 290);

  // --- PAGE 2: DETAILED TRANSACTION SHEET ---
  doc.addPage();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(30, 136, 229);
  doc.text('📜 Detailed Transactions Breakdown', 14, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(90, 108, 125);
  doc.text('Below is the list of expenses registered for the active reporting period.', 14, 26);

  drawLine(30);

  // Table Headers
  let tableY = 38;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(44, 62, 80);

  doc.text('Date', 15, tableY);
  doc.text('Title', 38, tableY);
  doc.text('Category', 90, tableY);
  doc.text('Amount', 132, tableY);
  doc.text('Notes / Memo', 156, tableY);

  drawLine(tableY + 3);
  tableY += 9;

  // Render transactions
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);

  if (!expenses || expenses.length === 0) {
    doc.text('No transaction logs recorded for this month.', 15, tableY);
  } else {
    expenses.forEach((exp) => {
      const d = new Date(exp.date);
      const expDate = `${String(d.getUTCMonth() + 1).padStart(2, '0')}/${String(d.getUTCDate()).padStart(2, '0')}/${d.getUTCFullYear()}`;
      const titleText = doc.splitTextToSize(exp.title, 48);
      const notesText = doc.splitTextToSize(exp.notes || '-', 36);

      // Check if Y exceeds page limit (280) and add new page
      if (tableY > 275) {
        // Page 2 Footer before adding next page
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text('Student Expense Tracker App • Powered by React & Express', 14, 290);

        doc.addPage();
        tableY = 25;

        // Table Headers for the new page
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(44, 62, 80);
        doc.text('Date', 15, tableY);
        doc.text('Title', 38, tableY);
        doc.text('Category', 90, tableY);
        doc.text('Amount', 132, tableY);
        doc.text('Notes / Memo', 156, tableY);

        drawLine(tableY + 3);
        tableY += 9;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
      }

      doc.text(expDate, 15, tableY);
      doc.text(titleText[0] || '', 38, tableY);
      doc.text(exp.category, 90, tableY);
      doc.text(formatPDFRupees(exp.amount), 132, tableY);
      doc.text(notesText[0] || '', 156, tableY);

      // Row spacing height calculation
      const linesUsed = Math.max(titleText.length, notesText.length, 1);
      const rowHeight = linesUsed * 5.5;

      tableY += rowHeight;
      drawLine(tableY - 2);
      tableY += 4;
    });
  }

  // Footer notes for Page 2
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Student Expense Tracker App • Powered by React & Express', 14, 290);
  doc.text('Page 2 of 2', 182, 290);

  // Save the PDF doc
  doc.save(`Student_Expense_Report_${dateStr.replace(/\//g, '-')}.pdf`);
};

export default generatePDFReport;
