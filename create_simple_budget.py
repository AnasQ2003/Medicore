import xlsxwriter

target_file = r'C:\Users\anasq\OneDrive\Desktop\Budget\Expense_Simple.xlsx'
final_file = r'C:\Users\anasq\OneDrive\Desktop\Budget\Expense.xlsx'

workbook = xlsxwriter.Workbook(target_file)

# ==========================================
# COLOR PALETTE: Clean, Premium Modern Slate & Emerald
# ==========================================
C_NAVY_DARK   = '#0F172A'  # Slate 900
C_NAVY_MED    = '#1E293B'  # Slate 800
C_TEAL        = '#0D9488'  # Teal 600
C_GREEN       = '#10B981'  # Emerald 500
C_RED         = '#EF4444'  # Rose 500
C_BLUE        = '#3B82F6'  # Blue 500
C_BG_LIGHT    = '#F8FAFC'  # Slate 50
C_BG_ALT      = '#F1F5F9'  # Slate 100
C_BORDER      = '#CBD5E1'  # Slate 300
C_BORDER_DARK = '#64748B'  # Slate 500

FONT = 'Segoe UI'

# ==========================================
# FORMAT DEFINITIONS
# ==========================================
# Main Header
f_header_title = workbook.add_format({
    'bold': True, 'font_size': 14, 'font_color': '#FFFFFF',
    'bg_color': C_NAVY_DARK, 'valign': 'vcenter', 'font_name': FONT
})

f_filter_label = workbook.add_format({
    'bold': True, 'font_size': 11, 'font_color': '#FFFFFF',
    'bg_color': C_NAVY_DARK, 'align': 'right', 'valign': 'vcenter', 'font_name': FONT
})

f_filter_box = workbook.add_format({
    'bold': True, 'font_size': 12, 'font_color': C_NAVY_DARK,
    'bg_color': '#FEF08A',  # Soft Yellow Highlight for filter
    'align': 'center', 'valign': 'vcenter', 'font_name': FONT,
    'border': 2, 'border_color': '#CA8A04'
})

# KPI Cards
f_card_title = workbook.add_format({
    'bold': True, 'font_size': 8, 'font_color': '#64748B', 'bg_color': '#FFFFFF',
    'align': 'center', 'valign': 'vcenter', 'font_name': FONT,
    'top': 1, 'left': 1, 'right': 1, 'top_color': C_BORDER, 'left_color': C_BORDER, 'right_color': C_BORDER
})

f_card_income = workbook.add_format({
    'bold': True, 'font_size': 13, 'font_color': '#059669', 'bg_color': '#FFFFFF',
    'align': 'center', 'valign': 'vcenter', 'font_name': FONT,
    'bottom': 1, 'left': 1, 'right': 1, 'bottom_color': C_BORDER, 'left_color': C_BORDER, 'right_color': C_BORDER,
    'num_format': 'Rs #,##0'
})

f_card_expense = workbook.add_format({
    'bold': True, 'font_size': 13, 'font_color': '#DC2626', 'bg_color': '#FFFFFF',
    'align': 'center', 'valign': 'vcenter', 'font_name': FONT,
    'bottom': 1, 'left': 1, 'right': 1, 'bottom_color': C_BORDER, 'left_color': C_BORDER, 'right_color': C_BORDER,
    'num_format': 'Rs #,##0'
})

f_card_savings = workbook.add_format({
    'bold': True, 'font_size': 13, 'font_color': C_NAVY_DARK, 'bg_color': '#FFFFFF',
    'align': 'center', 'valign': 'vcenter', 'font_name': FONT,
    'bottom': 1, 'left': 1, 'right': 1, 'bottom_color': C_BORDER, 'left_color': C_BORDER, 'right_color': C_BORDER,
    'num_format': 'Rs #,##0'
})

f_card_rate = workbook.add_format({
    'bold': True, 'font_size': 13, 'font_color': C_TEAL, 'bg_color': '#FFFFFF',
    'align': 'center', 'valign': 'vcenter', 'font_name': FONT,
    'bottom': 1, 'left': 1, 'right': 1, 'bottom_color': C_BORDER, 'left_color': C_BORDER, 'right_color': C_BORDER,
    'num_format': '0.0%'
})

# Table Headers
f_tbl_hdr_left = workbook.add_format({
    'bold': True, 'font_size': 9, 'font_color': '#FFFFFF', 'bg_color': C_NAVY_MED,
    'align': 'left', 'valign': 'vcenter', 'font_name': FONT, 'border': 1, 'border_color': C_BORDER_DARK
})

f_tbl_hdr = workbook.add_format({
    'bold': True, 'font_size': 9, 'font_color': '#FFFFFF', 'bg_color': C_NAVY_MED,
    'align': 'center', 'valign': 'vcenter', 'font_name': FONT, 'border': 1, 'border_color': C_BORDER_DARK
})

f_tbl_hdr_tot = workbook.add_format({
    'bold': True, 'font_size': 9, 'font_color': '#FFFFFF', 'bg_color': C_TEAL,
    'align': 'center', 'valign': 'vcenter', 'font_name': FONT, 'border': 1, 'border_color': C_BORDER_DARK
})

# Table Data Formats
f_data_txt = workbook.add_format({
    'font_size': 9, 'font_name': FONT, 'font_color': '#1E293B',
    'align': 'left', 'valign': 'vcenter', 'border': 1, 'border_color': C_BORDER
})
f_data_txt_alt = workbook.add_format({
    'font_size': 9, 'font_name': FONT, 'font_color': '#1E293B', 'bg_color': C_BG_ALT,
    'align': 'left', 'valign': 'vcenter', 'border': 1, 'border_color': C_BORDER
})

f_data_num = workbook.add_format({
    'font_size': 9, 'font_name': FONT, 'font_color': '#1E293B',
    'align': 'right', 'valign': 'vcenter', 'border': 1, 'border_color': C_BORDER,
    'num_format': '#,##0'
})
f_data_num_alt = workbook.add_format({
    'font_size': 9, 'font_name': FONT, 'font_color': '#1E293B', 'bg_color': C_BG_ALT,
    'align': 'right', 'valign': 'vcenter', 'border': 1, 'border_color': C_BORDER,
    'num_format': '#,##0'
})

f_data_num_bold = workbook.add_format({
    'bold': True, 'font_size': 9, 'font_name': FONT, 'font_color': C_NAVY_DARK,
    'align': 'right', 'valign': 'vcenter', 'border': 1, 'border_color': C_BORDER,
    'num_format': '#,##0'
})

# Summary Rows
f_row_exp_lbl = workbook.add_format({
    'bold': True, 'font_size': 9, 'font_name': FONT, 'font_color': '#991B1B', 'bg_color': '#FEE2E2',
    'align': 'left', 'valign': 'vcenter', 'top': 2, 'bottom': 1, 'top_color': '#DC2626', 'bottom_color': C_BORDER,
    'left': 1, 'right': 1, 'left_color': C_BORDER, 'right_color': C_BORDER
})
f_row_exp_val = workbook.add_format({
    'bold': True, 'font_size': 9, 'font_name': FONT, 'font_color': '#991B1B', 'bg_color': '#FEE2E2',
    'align': 'right', 'valign': 'vcenter', 'top': 2, 'bottom': 1, 'top_color': '#DC2626', 'bottom_color': C_BORDER,
    'left': 1, 'right': 1, 'left_color': C_BORDER, 'right_color': C_BORDER,
    'num_format': '#,##0'
})

f_row_sal_lbl = workbook.add_format({
    'bold': True, 'font_size': 9, 'font_name': FONT, 'font_color': '#065F46', 'bg_color': '#D1FAE5',
    'align': 'left', 'valign': 'vcenter', 'border': 1, 'border_color': C_BORDER
})
f_row_sal_val = workbook.add_format({
    'bold': True, 'font_size': 9, 'font_name': FONT, 'font_color': '#065F46', 'bg_color': '#D1FAE5',
    'align': 'right', 'valign': 'vcenter', 'border': 1, 'border_color': C_BORDER,
    'num_format': '#,##0'
})

f_row_sav_lbl = workbook.add_format({
    'bold': True, 'font_size': 9, 'font_name': FONT, 'font_color': C_NAVY_DARK, 'bg_color': '#E0F2FE',
    'align': 'left', 'valign': 'vcenter', 'border': 1, 'border_color': C_BORDER
})
f_row_sav_val = workbook.add_format({
    'bold': True, 'font_size': 9, 'font_name': FONT, 'font_color': C_NAVY_DARK, 'bg_color': '#E0F2FE',
    'align': 'right', 'valign': 'vcenter', 'border': 1, 'border_color': C_BORDER,
    'num_format': '#,##0'
})

f_row_rate_lbl = workbook.add_format({
    'bold': True, 'font_size': 9, 'font_name': FONT, 'font_color': '#475569', 'bg_color': C_BG_LIGHT,
    'align': 'left', 'valign': 'vcenter', 'border': 1, 'border_color': C_BORDER
})
f_row_rate_val = workbook.add_format({
    'bold': True, 'font_size': 9, 'font_name': FONT, 'font_color': '#475569', 'bg_color': C_BG_LIGHT,
    'align': 'right', 'valign': 'vcenter', 'border': 1, 'border_color': C_BORDER,
    'num_format': '0.0%'
})

# Notes format
f_notes_title = workbook.add_format({
    'bold': True, 'font_size': 9, 'font_name': FONT, 'font_color': C_NAVY_DARK, 'bg_color': '#FEF3C7',
    'align': 'left', 'valign': 'vcenter', 'border': 1, 'border_color': '#F59E0B'
})
f_notes_text = workbook.add_format({
    'font_size': 9, 'font_name': FONT, 'font_color': '#451A03', 'bg_color': '#FFFBEB',
    'align': 'left', 'valign': 'vcenter', 'border': 1, 'border_color': '#FDE68A'
})

# Category & Month Definitions
MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
COL_LETTERS = ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M']

CATEGORIES = [
    'Office Lunch',
    'Monthly Grocery-Imtiaz',
    'Fun',
    'Electric Bill',
    'Phone Bill',
    'Water Bill',
    'Gas Bill',
    'Sadka',
    'Bike Maintenance',
    'Petrol',
    'Shopping',
    'Mobile Data',
    'Hair Cut',
    'Others',
    'Food',
]

DATA_2026 = {
    'Office Lunch':           [   0,     0,  500,  1350,  1150,     0,  2290,  3000,    0, 0, 0, 0],
    'Monthly Grocery-Imtiaz': [   0,     0,    0,     0,     0,     0,     0, 32693,    0, 0, 0, 0],
    'Fun':                    [   0,     0,    0,     0,     0,     0,     0,  3887, 1044, 0, 0, 0],
    'Electric Bill':          [   0,     0,    0,     0,     0,     0,     0,  5128,    0, 0, 0, 0],
    'Phone Bill':             [   0,     0,    0,     0,     0,     0,     0,     0,    0, 0, 0, 0],
    'Water Bill':             [   0,     0,    0,     0,     0,     0,     0,     0,    0, 0, 0, 0],
    'Gas Bill':               [   0,     0,    0,     0,     0,     0,     0,  1250,    0, 0, 0, 0],
    'Sadka':                  [   0,     0,    0,     0,     0,     0,     0,     0,    0, 0, 0, 0],
    'Bike Maintenance':       [   0,     0,    0,  1530,   120,     0,  8050,   850,    0, 0, 0, 0],
    'Petrol':                 [1000,  3000, 3450,  6570,  4000,  6000,  3000,  5000,    0, 0, 0, 0],
    'Shopping':               [   0, 15000,    0,  2500,   250,   100, 63200,  2850,    0, 0, 0, 0],
    'Mobile Data':            [   0,     0,  500,  1000,   810,  1350,  1350,  1080,    0, 0, 0, 0],
    'Hair Cut':               [   0,   300,  400,   300,   300,     0,   300,   300,  300, 0, 0, 0],
    'Others':                 [   0,     0,    0,     0,     0,     0,     0,     0,    0, 0, 0, 0],
    'Food':                   [ 100,     0, 2500,  1140,     0,  1030,  1570,  4700,    0, 0, 0, 0],
}
SALARY_2026 = [0, 0, 0, 33320, 25000, 24194, 27500, 86000, 0, 0, 0, 0]

NOTES_2026 = [
    '• July: Bought House fan = Rs 43,200 | Bike new tyres = Rs 5,000 | Abeerah exam fees = Rs 20,000',
    '• July Balance Calculation: Total Outflow Rs 164,573 - Salary Rs 86,000 = Rs 78,573 deficit offset from reserves',
    '• August: Mega grocery restock at Imtiaz Super Market = Rs 32,693 | Electric bill = Rs 5,128'
]

# ==============================================================================
# FUNCTION TO CREATE YEAR SHEET
# ==============================================================================
def create_year_sheet(wb, sheet_name, data_dict, salary_list, notes_list):
    ws = wb.add_worksheet(sheet_name)
    ws.hide_gridlines(0)
    
    # Column Widths (Compact, fits in standard 1080p screen)
    ws.set_column('A:A', 22)  # Category
    for c in range(1, 13):
        ws.set_column(c, c, 9) # Jan - Dec
    ws.set_column('N:N', 12)  # Total
    ws.set_column('O:O', 10)  # Avg/Mo
    ws.set_column('P:P', 2)   # Spacer
    ws.set_column('Q:Z', 10)  # Chart space
    
    # Title Row
    ws.set_row(0, 24)
    ws.merge_range('A1:O1', f'  📊 YEAR {sheet_name} EXPENSE & BUDGET TRACKER', f_header_title)
    
    # KPI Cards (Row 3 & 4)
    ws.set_row(2, 14)
    ws.set_row(3, 22)
    
    ws.merge_range('A3:C3', 'TOTAL INCOME (YTD)', f_card_title)
    ws.merge_range('A4:C4', '=N23', f_card_income)
    
    ws.merge_range('E3:G3', 'TOTAL EXPENSES (YTD)', f_card_title)
    ws.merge_range('E4:G4', '=N22', f_card_expense)
    
    ws.merge_range('I3:K3', 'NET SAVINGS (YTD)', f_card_title)
    ws.merge_range('I4:K4', '=N24', f_card_savings)
    
    ws.merge_range('M3:O3', 'SAVINGS RATE %', f_card_title)
    ws.merge_range('M4:O4', '=N25', f_card_rate)
    
    # Table Header (Row 6)
    ws.set_row(5, 20)
    ws.write('A6', 'Expense Category', f_tbl_hdr_left)
    for idx, m in enumerate(MONTHS):
        ws.write(f'{COL_LETTERS[idx]}6', m, f_tbl_hdr)
    ws.write('N6', 'Total (YTD)', f_tbl_hdr_tot)
    ws.write('O6', 'Avg / Mo', f_tbl_hdr_tot)
    
    # Data Rows (Rows 7 to 21)
    for idx, cat in enumerate(CATEGORIES):
        r = 7 + idx
        ws.set_row(r - 1, 17)
        is_even = (idx % 2 == 0)
        f_t = f_data_txt if is_even else f_data_txt_alt
        f_n = f_data_num if is_even else f_data_num_alt
        
        ws.write(f'A{r}', cat, f_t)
        vals = data_dict.get(cat, [0]*12)
        for m_idx, v in enumerate(vals):
            ws.write(f'{COL_LETTERS[m_idx]}{r}', v, f_n)
            
        ws.write_formula(f'N{r}', f'=SUM(B{r}:M{r})', f_data_num_bold)
        ws.write_formula(f'O{r}', f'=AVERAGE(B{r}:M{r})', f_data_num)
        
    # Summary Rows (Row 22: Total Exp, Row 23: Salary, Row 24: Net Savings, Row 25: Savings Rate)
    # Row 22 (Index 21 in formula)
    ws.set_row(21, 20)
    ws.write('A22', 'TOTAL COST', f_row_exp_lbl)
    for idx in range(12):
        col = COL_LETTERS[idx]
        ws.write_formula(f'{col}22', f'=SUM({col}7:{col}21)', f_row_exp_val)
    ws.write_formula('N22', '=SUM(N7:N21)', f_row_exp_val)
    ws.write_formula('O22', '=AVERAGE(B22:M22)', f_row_exp_val)
    
    # Row 23: Salary
    ws.set_row(22, 19)
    ws.write('A23', 'SALARY / INCOME', f_row_sal_lbl)
    for idx, s in enumerate(salary_list):
        col = COL_LETTERS[idx]
        ws.write(f'{col}23', s, f_row_sal_val)
    ws.write_formula('N23', '=SUM(B23:M23)', f_row_sal_val)
    ws.write_formula('O23', '=AVERAGE(B23:M23)', f_row_sal_val)
    
    # Row 24: Net Savings
    ws.set_row(23, 19)
    ws.write('A24', 'NET SAVING', f_row_sav_lbl)
    for idx in range(12):
        col = COL_LETTERS[idx]
        ws.write_formula(f'{col}24', f'={col}23-{col}22', f_row_sav_val)
    ws.write_formula('N24', '=N23-N22', f_row_sav_val)
    ws.write_formula('O24', '=AVERAGE(B24:M24)', f_row_sav_val)
    
    # Row 25: Savings Rate
    ws.set_row(24, 18)
    ws.write('A25', 'SAVINGS RATE %', f_row_rate_lbl)
    for idx in range(12):
        col = COL_LETTERS[idx]
        ws.write_formula(f'{col}25', f'=IF({col}23>0, {col}24/{col}23, 0)', f_row_rate_val)
    ws.write_formula('N25', '=IF(N23>0, N24/N23, 0)', f_row_rate_val)
    ws.write_formula('O25', '=AVERAGE(B25:M25)', f_row_rate_val)
    
    # Conditional formatting on Savings
    ws.conditional_format('B24:N24', {
        'type': 'cell', 'criteria': '<', 'value': 0,
        'format': workbook.add_format({'bg_color': '#FEE2E2', 'font_color': '#991B1B', 'num_format': '#,##0'})
    })
    ws.conditional_format('B24:N24', {
        'type': 'cell', 'criteria': '>', 'value': 0,
        'format': workbook.add_format({'bg_color': '#D1FAE5', 'font_color': '#065F46', 'num_format': '#,##0'})
    })
    
    # Notes Box (Row 27-30)
    ws.set_row(26, 18)
    ws.merge_range('A27:O27', '  📌 MAJOR PURCHASES & NOTES', f_notes_title)
    for n_idx, note_text in enumerate(notes_list):
        r_n = 28 + n_idx
        ws.set_row(r_n - 1, 16)
        ws.merge_range(f'A{r_n}:O{r_n}', f'  {note_text}', f_notes_text)
        
    # ==========================================
    # CHARTS (Placed right beside the table)
    # ==========================================
    # Chart 1: Monthly Cashflow (Income vs Expense vs Savings)
    chart1 = wb.add_chart({'type': 'column'})
    chart1.add_series({
        'name':       f"='{sheet_name}'!$A$23",
        'categories': f"='{sheet_name}'!$B$6:$M$6",
        'values':     f"='{sheet_name}'!$B$23:$M$23",
        'fill':       {'color': '#10B981'},
        'border':     {'none': True}
    })
    chart1.add_series({
        'name':       f"='{sheet_name}'!$A$22",
        'categories': f"='{sheet_name}'!$B$6:$M$6",
        'values':     f"='{sheet_name}'!$B$22:$M$22",
        'fill':       {'color': '#EF4444'},
        'border':     {'none': True}
    })
    chart1.add_series({
        'name':       f"='{sheet_name}'!$A$24",
        'categories': f"='{sheet_name}'!$B$6:$M$6",
        'values':     f"='{sheet_name}'!$B$24:$M$24",
        'fill':       {'color': '#3B82F6'},
        'border':     {'none': True}
    })
    chart1.set_title({'name': 'Monthly Cash Flow (Income vs Expenses vs Savings)', 'name_font': {'size': 11, 'bold': True, 'name': FONT}})
    chart1.set_x_axis({'num_font': {'size': 8, 'name': FONT}})
    chart1.set_y_axis({'num_font': {'size': 8, 'name': FONT}, 'major_gridlines': {'visible': True, 'line': {'color': '#E2E8F0'}}})
    chart1.set_legend({'position': 'top', 'font': {'size': 8, 'name': FONT}})
    chart1.set_size({'width': 500, 'height': 240})
    chart1.set_chartarea({'border': {'color': '#CBD5E1'}})
    ws.insert_chart('Q2', chart1)
    
    # Chart 2: Category Donut Chart
    chart2 = wb.add_chart({'type': 'doughnut'})
    chart2.add_series({
        'name':       'Spending by Category',
        'categories': f"='{sheet_name}'!$A$7:$A$21",
        'values':     f"='{sheet_name}'!$N$7:$N$21",
        'points': [
            {'fill': {'color': '#8B5CF6'}}, # Lunch
            {'fill': {'color': '#EC4899'}}, # Grocery
            {'fill': {'color': '#F43F5E'}}, # Fun
            {'fill': {'color': '#14B8A6'}}, # Electric
            {'fill': {'color': '#94A3B8'}}, # Phone
            {'fill': {'color': '#CBD5E1'}}, # Water
            {'fill': {'color': '#06B6D4'}}, # Gas
            {'fill': {'color': '#E2E8F0'}}, # Sadka
            {'fill': {'color': '#3B82F6'}}, # Bike
            {'fill': {'color': '#F59E0B'}}, # Petrol
            {'fill': {'color': '#6366F1'}}, # Shopping
            {'fill': {'color': '#0EA5E9'}}, # Mobile Data
            {'fill': {'color': '#84CC16'}}, # Hair Cut
            {'fill': {'color': '#64748B'}}, # Others
            {'fill': {'color': '#10B981'}}, # Food
        ]
    })
    chart2.set_title({'name': 'Spending Share by Category', 'name_font': {'size': 11, 'bold': True, 'name': FONT}})
    chart2.set_legend({'position': 'right', 'font': {'size': 8, 'name': FONT}})
    chart2.set_hole_size(45)
    chart2.set_size({'width': 500, 'height': 220})
    chart2.set_chartarea({'border': {'color': '#CBD5E1'}})
    ws.insert_chart('Q14', chart2)
    
    return ws


# ==============================================================================
# SHEET 1: ALL-IN-ONE INTERACTIVE DASHBOARD (WITH YEAR FILTER)
# ==============================================================================
ws_main = workbook.add_worksheet('Dashboard')
ws_main.hide_gridlines(0)

# Column Widths
ws_main.set_column('A:A', 22)  # Category
for c in range(1, 13):
    ws_main.set_column(c, c, 9) # Jan - Dec
ws_main.set_column('N:N', 12)  # Total
ws_main.set_column('O:O', 10)  # Avg/Mo
ws_main.set_column('P:P', 2)   # Spacer
ws_main.set_column('Q:Z', 10)  # Chart space

# Banner & Interactive Year Filter
ws_main.set_row(0, 26)
ws_main.merge_range('A1:J1', '  📊 MASTER FINANCIAL DASHBOARD & TRACKER', f_header_title)
ws_main.merge_range('K1:L1', 'SELECT YEAR ➔', f_filter_label)
ws_main.write('M1', '2026', f_filter_box)  # Default Year
ws_main.merge_range('N1:O1', '  [Filter Active]', f_filter_label)

# Add Dropdown Data Validation on M1 (Year Selector)
ws_main.data_validation('M1', {
    'validate': 'list',
    'source': ['2026', '2027', '2028'],
    'input_title': 'Select Year:',
    'input_message': 'Pick 2026, 2027, or 2028 from the dropdown to instantly switch views.',
    'error_title': 'Invalid Year',
    'error_message': 'Please choose a valid year from the list.'
})

# KPI Cards (Row 3 & 4) - Dynamically pulling from selected Year in M1
ws_main.set_row(2, 14)
ws_main.set_row(3, 22)

ws_main.merge_range('A3:C3', 'TOTAL INCOME (YTD)', f_card_title)
ws_main.write_formula('A4', '=INDIRECT("\'" & $M$1 & "\'!N23")', f_card_income)
ws_main.merge_range('A4:C4', '=INDIRECT("\'" & $M$1 & "\'!N23")', f_card_income)

ws_main.merge_range('E3:G3', 'TOTAL EXPENSES (YTD)', f_card_title)
ws_main.merge_range('E4:G4', '=INDIRECT("\'" & $M$1 & "\'!N22")', f_card_expense)

ws_main.merge_range('I3:K3', 'NET SAVINGS (YTD)', f_card_title)
ws_main.merge_range('I4:K4', '=INDIRECT("\'" & $M$1 & "\'!N24")', f_card_savings)

ws_main.merge_range('M3:O3', 'SAVINGS RATE %', f_card_title)
ws_main.merge_range('M4:O4', '=INDIRECT("\'" & $M$1 & "\'!N25")', f_card_rate)

# Table Header (Row 6)
ws_main.set_row(5, 20)
ws_main.write('A6', 'Expense Category', f_tbl_hdr_left)
for idx, m in enumerate(MONTHS):
    ws_main.write(f'{COL_LETTERS[idx]}6', m, f_tbl_hdr)
ws_main.write('N6', 'Total (YTD)', f_tbl_hdr_tot)
ws_main.write('O6', 'Avg / Mo', f_tbl_hdr_tot)

# Dynamic Data Rows (Rows 7 to 21)
for idx, cat in enumerate(CATEGORIES):
    r = 7 + idx
    ws_main.set_row(r - 1, 17)
    is_even = (idx % 2 == 0)
    f_t = f_data_txt if is_even else f_data_txt_alt
    f_n = f_data_num if is_even else f_data_num_alt
    
    ws_main.write(f'A{r}', cat, f_t)
    for m_idx in range(12):
        col = COL_LETTERS[m_idx]
        ws_main.write_formula(f'{col}{r}', f'=INDIRECT("\'" & $M$1 & "\'!{col}{r}")', f_n)
        
    ws_main.write_formula(f'N{r}', f'=SUM(B{r}:M{r})', f_data_num_bold)
    ws_main.write_formula(f'O{r}', f'=AVERAGE(B{r}:M{r})', f_data_num)

# Summary Rows (Row 22: Total Exp, Row 23: Salary, Row 24: Net Savings, Row 25: Savings Rate)
ws_main.set_row(21, 20)
ws_main.write('A22', 'TOTAL COST', f_row_exp_lbl)
for idx in range(12):
    col = COL_LETTERS[idx]
    ws_main.write_formula(f'{col}22', f'=SUM({col}7:{col}21)', f_row_exp_val)
ws_main.write_formula('N22', '=SUM(N7:N21)', f_row_exp_val)
ws_main.write_formula('O22', '=AVERAGE(B22:M22)', f_row_exp_val)

# Row 23: Salary
ws_main.set_row(22, 19)
ws_main.write('A23', 'SALARY / INCOME', f_row_sal_lbl)
for idx in range(12):
    col = COL_LETTERS[idx]
    ws_main.write_formula(f'{col}23', f'=INDIRECT("\'" & $M$1 & "\'!{col}23")', f_row_sal_val)
ws_main.write_formula('N23', '=SUM(B23:M23)', f_row_sal_val)
ws_main.write_formula('O23', '=AVERAGE(B23:M23)', f_row_sal_val)

# Row 24: Net Savings
ws_main.set_row(23, 19)
ws_main.write('A24', 'NET SAVING', f_row_sav_lbl)
for idx in range(12):
    col = COL_LETTERS[idx]
    ws_main.write_formula(f'{col}24', f'={col}23-{col}22', f_row_sav_val)
ws_main.write_formula('N24', '=N23-N22', f_row_sav_val)
ws_main.write_formula('O24', '=AVERAGE(B24:M24)', f_row_sav_val)

# Row 25: Savings Rate
ws_main.set_row(24, 18)
ws_main.write('A25', 'SAVINGS RATE %', f_row_rate_lbl)
for idx in range(12):
    col = COL_LETTERS[idx]
    ws_main.write_formula(f'{col}25', f'=IF({col}23>0, {col}24/{col}23, 0)', f_row_rate_val)
ws_main.write_formula('N25', '=IF(N23>0, N24/N23, 0)', f_row_rate_val)
ws_main.write_formula('O25', '=AVERAGE(B25:M25)', f_row_rate_val)

# Conditional formatting on Dashboard Savings
ws_main.conditional_format('B24:N24', {
    'type': 'cell', 'criteria': '<', 'value': 0,
    'format': workbook.add_format({'bg_color': '#FEE2E2', 'font_color': '#991B1B', 'num_format': '#,##0'})
})
ws_main.conditional_format('B24:N24', {
    'type': 'cell', 'criteria': '>', 'value': 0,
    'format': workbook.add_format({'bg_color': '#D1FAE5', 'font_color': '#065F46', 'num_format': '#,##0'})
})

# Quick Instructions / Tips
ws_main.set_row(26, 18)
ws_main.merge_range('A27:O27', '  💡 HOW TO USE THIS DASHBOARD', f_notes_title)
ws_main.set_row(27, 16)
ws_main.merge_range('A28:O28', '  1. Click cell M1 (Yellow box above) to pick 2026, 2027, or 2028 from the dropdown.', f_notes_text)
ws_main.set_row(28, 16)
ws_main.merge_range('A29:O29', '  2. To enter or edit your monthly numbers for any year, click that year\'s tab below (e.g. "2026" or "2027").', f_notes_text)
ws_main.set_row(29, 16)
ws_main.merge_range('A30:O30', '  3. Everything calculates automatically in real-time across all sheets and charts.', f_notes_text)

# Dashboard Charts (Live linked to the Dashboard Table)
# Chart 1: Cash Flow Column Chart
chart_main_1 = workbook.add_chart({'type': 'column'})
chart_main_1.add_series({
    'name':       "='Dashboard'!$A$23",
    'categories': "='Dashboard'!$B$6:$M$6",
    'values':     "='Dashboard'!$B$23:$M$23",
    'fill':       {'color': '#10B981'},
    'border':     {'none': True}
})
chart_main_1.add_series({
    'name':       "='Dashboard'!$A$22",
    'categories': "='Dashboard'!$B$6:$M$6",
    'values':     "='Dashboard'!$B$22:$M$22",
    'fill':       {'color': '#EF4444'},
    'border':     {'none': True}
})
chart_main_1.add_series({
    'name':       "='Dashboard'!$A$24",
    'categories': "='Dashboard'!$B$6:$M$6",
    'values':     "='Dashboard'!$B$24:$M$24",
    'fill':       {'color': '#3B82F6'},
    'border':     {'none': True}
})
chart_main_1.set_title({'name': 'Monthly Cash Flow (Income vs Expenses vs Net Savings)', 'name_font': {'size': 11, 'bold': True, 'name': FONT}})
chart_main_1.set_x_axis({'num_font': {'size': 8, 'name': FONT}})
chart_main_1.set_y_axis({'num_font': {'size': 8, 'name': FONT}, 'major_gridlines': {'visible': True, 'line': {'color': '#E2E8F0'}}})
chart_main_1.set_legend({'position': 'top', 'font': {'size': 8, 'name': FONT}})
chart_main_1.set_size({'width': 500, 'height': 240})
chart_main_1.set_chartarea({'border': {'color': '#CBD5E1'}})
ws_main.insert_chart('Q2', chart_main_1)

# Chart 2: Category Donut Chart
chart_main_2 = workbook.add_chart({'type': 'doughnut'})
chart_main_2.add_series({
    'name':       'Spending by Category',
    'categories': "='Dashboard'!$A$7:$A$21",
    'values':     "='Dashboard'!$N$7:$N$21",
    'points': [
        {'fill': {'color': '#8B5CF6'}},
        {'fill': {'color': '#EC4899'}},
        {'fill': {'color': '#F43F5E'}},
        {'fill': {'color': '#14B8A6'}},
        {'fill': {'color': '#94A3B8'}},
        {'fill': {'color': '#CBD5E1'}},
        {'fill': {'color': '#06B6D4'}},
        {'fill': {'color': '#E2E8F0'}},
        {'fill': {'color': '#3B82F6'}},
        {'fill': {'color': '#F59E0B'}},
        {'fill': {'color': '#6366F1'}},
        {'fill': {'color': '#0EA5E9'}},
        {'fill': {'color': '#84CC16'}},
        {'fill': {'color': '#64748B'}},
        {'fill': {'color': '#10B981'}},
    ]
})
chart_main_2.set_title({'name': 'Spending Share by Category', 'name_font': {'size': 11, 'bold': True, 'name': FONT}})
chart_main_2.set_legend({'position': 'right', 'font': {'size': 8, 'name': FONT}})
chart_main_2.set_hole_size(45)
chart_main_2.set_size({'width': 500, 'height': 220})
chart_main_2.set_chartarea({'border': {'color': '#CBD5E1'}})
ws_main.insert_chart('Q14', chart_main_2)


# ==============================================================================
# CREATE YEAR SHEETS: 2026, 2027, 2028
# ==============================================================================
create_year_sheet(workbook, '2026', DATA_2026, SALARY_2026, NOTES_2026)

# 2027 Blank Template
DATA_BLANK = {cat: [0]*12 for cat in CATEGORIES}
SALARY_BLANK = [0]*12
NOTES_BLANK = [
    '• Type your major one-off expenses and financial notes for 2027 here.',
    '• All calculations and charts will update automatically as you enter numbers.'
]
create_year_sheet(workbook, '2027', DATA_BLANK, SALARY_BLANK, NOTES_BLANK)
create_year_sheet(workbook, '2028', DATA_BLANK, SALARY_BLANK, NOTES_BLANK)

workbook.close()
print("Success! Simplified All-in-One Budget Workbook Generated at:", target_file)

import shutil
try:
    shutil.copyfile(target_file, final_file)
    print("Also successfully updated:", final_file)
except Exception as e:
    print("Notice: Expense.xlsx is currently open in Excel. Please close it in Excel if you want to overwrite it automatically, or open Expense_Simple.xlsx directly.")
