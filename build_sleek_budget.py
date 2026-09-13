import xlsxwriter
import os
import shutil

folder = r'C:\Users\anasq\OneDrive\Desktop\Budget'
temp_file = os.path.join(folder, 'Expense_Temp.xlsx')
final_file = os.path.join(folder, 'Expense_New.xlsx')

workbook = xlsxwriter.Workbook(temp_file)

# ==========================================
# PALETTE & TYPOGRAPHY DEFINITION
# ==========================================
C_DARK_NAVY   = '#0F172A'  # Slate 900
C_HEADER_NAVY = '#1E293B'  # Slate 800
C_TEAL        = '#0D9488'  # Teal 600
C_EMERALD     = '#10B981'  # Emerald 500
C_ROSE        = '#F43F5E'  # Rose 500
C_BLUE        = '#0EA5E9'  # Sky 500
C_AMBER       = '#F59E0B'  # Amber 500
C_INDIGO      = '#6366F1'  # Indigo 500
C_PURPLE      = '#8B5CF6'  # Purple 500
C_PINK        = '#EC4899'  # Pink 500

C_BG_LIGHT    = '#F8FAFC'  # Slate 50
C_BG_ALT      = '#F1F5F9'  # Slate 100
C_BORDER      = '#CBD5E1'  # Slate 300
C_BORDER_DARK = '#64748B'  # Slate 500

FONT = 'Segoe UI'

# ==========================================
# CELL FORMATS
# ==========================================
# Header
f_banner = workbook.add_format({
    'bold': True, 'font_size': 14, 'font_color': '#FFFFFF',
    'bg_color': C_DARK_NAVY, 'valign': 'vcenter', 'font_name': FONT,
    'left': 0, 'right': 0, 'top': 0, 'bottom': 0
})

f_banner_tag = workbook.add_format({
    'bold': True, 'font_size': 10, 'font_color': '#38BDF8',
    'bg_color': C_DARK_NAVY, 'align': 'right', 'valign': 'vcenter', 'font_name': FONT, 'italic': True
})

# KPI Cards (Tinted backgrounds for premium look)
# Income Card (Emerald)
f_card_inc_lbl = workbook.add_format({
    'bold': True, 'font_size': 8, 'font_color': '#065F46', 'bg_color': '#ECFDF5',
    'align': 'center', 'valign': 'vcenter', 'font_name': FONT,
    'top': 1, 'left': 1, 'right': 1, 'top_color': '#A7F3D0', 'left_color': '#A7F3D0', 'right_color': '#A7F3D0'
})
f_card_inc_val = workbook.add_format({
    'bold': True, 'font_size': 14, 'font_color': '#047857', 'bg_color': '#ECFDF5',
    'align': 'center', 'valign': 'vcenter', 'font_name': FONT,
    'bottom': 1, 'left': 1, 'right': 1, 'bottom_color': '#A7F3D0', 'left_color': '#A7F3D0', 'right_color': '#A7F3D0',
    'num_format': 'Rs #,##0'
})

# Expense Card (Rose/Red)
f_card_exp_lbl = workbook.add_format({
    'bold': True, 'font_size': 8, 'font_color': '#991B1B', 'bg_color': '#FEF2F2',
    'align': 'center', 'valign': 'vcenter', 'font_name': FONT,
    'top': 1, 'left': 1, 'right': 1, 'top_color': '#FECACA', 'left_color': '#FECACA', 'right_color': '#FECACA'
})
f_card_exp_val = workbook.add_format({
    'bold': True, 'font_size': 14, 'font_color': '#DC2626', 'bg_color': '#FEF2F2',
    'align': 'center', 'valign': 'vcenter', 'font_name': FONT,
    'bottom': 1, 'left': 1, 'right': 1, 'bottom_color': '#FECACA', 'left_color': '#FECACA', 'right_color': '#FECACA',
    'num_format': 'Rs #,##0'
})

# Net Savings Card (Sky Blue)
f_card_sav_lbl = workbook.add_format({
    'bold': True, 'font_size': 8, 'font_color': '#1E40AF', 'bg_color': '#EFF6FF',
    'align': 'center', 'valign': 'vcenter', 'font_name': FONT,
    'top': 1, 'left': 1, 'right': 1, 'top_color': '#BFDBFE', 'left_color': '#BFDBFE', 'right_color': '#BFDBFE'
})
f_card_sav_val = workbook.add_format({
    'bold': True, 'font_size': 14, 'font_color': '#2563EB', 'bg_color': '#EFF6FF',
    'align': 'center', 'valign': 'vcenter', 'font_name': FONT,
    'bottom': 1, 'left': 1, 'right': 1, 'bottom_color': '#BFDBFE', 'left_color': '#BFDBFE', 'right_color': '#BFDBFE',
    'num_format': 'Rs #,##0'
})

# Savings Rate Card (Teal)
f_card_rat_lbl = workbook.add_format({
    'bold': True, 'font_size': 8, 'font_color': '#115E59', 'bg_color': '#F0FDFA',
    'align': 'center', 'valign': 'vcenter', 'font_name': FONT,
    'top': 1, 'left': 1, 'right': 1, 'top_color': '#99F6E4', 'left_color': '#99F6E4', 'right_color': '#99F6E4'
})
f_card_rat_val = workbook.add_format({
    'bold': True, 'font_size': 14, 'font_color': '#0D9488', 'bg_color': '#F0FDFA',
    'align': 'center', 'valign': 'vcenter', 'font_name': FONT,
    'bottom': 1, 'left': 1, 'right': 1, 'bottom_color': '#99F6E4', 'left_color': '#99F6E4', 'right_color': '#99F6E4',
    'num_format': '0.0%'
})

# Table Headers
f_tbl_hdr_left = workbook.add_format({
    'bold': True, 'font_size': 10, 'font_color': '#FFFFFF', 'bg_color': C_HEADER_NAVY,
    'align': 'left', 'valign': 'vcenter', 'font_name': FONT,
    'border': 1, 'border_color': C_BORDER_DARK
})

f_tbl_hdr_month = workbook.add_format({
    'bold': True, 'font_size': 10, 'font_color': '#FFFFFF', 'bg_color': C_HEADER_NAVY,
    'align': 'center', 'valign': 'vcenter', 'font_name': FONT,
    'border': 1, 'border_color': C_BORDER_DARK
})

f_tbl_hdr_tot = workbook.add_format({
    'bold': True, 'font_size': 10, 'font_color': '#FFFFFF', 'bg_color': C_TEAL,
    'align': 'center', 'valign': 'vcenter', 'font_name': FONT,
    'border': 1, 'border_color': C_BORDER_DARK
})

# Table Data
f_data_txt = workbook.add_format({
    'font_size': 9, 'font_name': FONT, 'font_color': '#1E293B',
    'align': 'left', 'valign': 'vcenter', 'border': 1, 'border_color': C_BORDER
})
f_data_txt_alt = workbook.add_format({
    'font_size': 9, 'font_name': FONT, 'font_color': '#1E293B', 'bg_color': C_BG_LIGHT,
    'align': 'left', 'valign': 'vcenter', 'border': 1, 'border_color': C_BORDER
})

f_data_num = workbook.add_format({
    'font_size': 9, 'font_name': FONT, 'font_color': '#1E293B',
    'align': 'right', 'valign': 'vcenter', 'border': 1, 'border_color': C_BORDER,
    'num_format': '#,##0'
})
f_data_num_alt = workbook.add_format({
    'font_size': 9, 'font_name': FONT, 'font_color': '#1E293B', 'bg_color': C_BG_LIGHT,
    'align': 'right', 'valign': 'vcenter', 'border': 1, 'border_color': C_BORDER,
    'num_format': '#,##0'
})

f_data_num_bold = workbook.add_format({
    'bold': True, 'font_size': 9, 'font_name': FONT, 'font_color': C_DARK_NAVY,
    'align': 'right', 'valign': 'vcenter', 'border': 1, 'border_color': C_BORDER,
    'num_format': '#,##0'
})

# Summary Rows Formats
f_row_exp_lbl = workbook.add_format({
    'bold': True, 'font_size': 10, 'font_name': FONT, 'font_color': '#991B1B', 'bg_color': '#FEE2E2',
    'align': 'left', 'valign': 'vcenter', 'top': 2, 'bottom': 1, 'top_color': '#DC2626', 'bottom_color': C_BORDER,
    'left': 1, 'right': 1, 'left_color': C_BORDER, 'right_color': C_BORDER
})
f_row_exp_val = workbook.add_format({
    'bold': True, 'font_size': 10, 'font_name': FONT, 'font_color': '#991B1B', 'bg_color': '#FEE2E2',
    'align': 'right', 'valign': 'vcenter', 'top': 2, 'bottom': 1, 'top_color': '#DC2626', 'bottom_color': C_BORDER,
    'left': 1, 'right': 1, 'left_color': C_BORDER, 'right_color': C_BORDER,
    'num_format': '#,##0'
})

f_row_sal_lbl = workbook.add_format({
    'bold': True, 'font_size': 10, 'font_name': FONT, 'font_color': '#065F46', 'bg_color': '#D1FAE5',
    'align': 'left', 'valign': 'vcenter', 'border': 1, 'border_color': C_BORDER
})
f_row_sal_val = workbook.add_format({
    'bold': True, 'font_size': 10, 'font_name': FONT, 'font_color': '#065F46', 'bg_color': '#D1FAE5',
    'align': 'right', 'valign': 'vcenter', 'border': 1, 'border_color': C_BORDER,
    'num_format': '#,##0'
})

f_row_sav_lbl = workbook.add_format({
    'bold': True, 'font_size': 10, 'font_name': FONT, 'font_color': C_DARK_NAVY, 'bg_color': '#E0F2FE',
    'align': 'left', 'valign': 'vcenter', 'border': 1, 'border_color': C_BORDER
})
f_row_sav_val = workbook.add_format({
    'bold': True, 'font_size': 10, 'font_name': FONT, 'font_color': C_DARK_NAVY, 'bg_color': '#E0F2FE',
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

# Notes Formats
f_notes_hdr = workbook.add_format({
    'bold': True, 'font_size': 9, 'font_name': FONT, 'font_color': '#78350F', 'bg_color': '#FEF3C7',
    'align': 'left', 'valign': 'vcenter', 'border': 1, 'border_color': '#F59E0B'
})
f_notes_body = workbook.add_format({
    'font_size': 9, 'font_name': FONT, 'font_color': '#451A03', 'bg_color': '#FFFBEB',
    'align': 'left', 'valign': 'vcenter', 'border': 1, 'border_color': '#FDE68A'
})

# Months & Columns
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
    '• July Highlights: Bought House Fan = Rs 43,200 | Bike New Tyres = Rs 5,000 | Abeerah Exam Fees = Rs 20,000',
    '• July Cash Flow: Outflow Rs 164,573 - Salary Rs 86,000 = Rs 78,573 deficit offset from reserves/savings',
    '• August Highlights: Mega Grocery Stock at Imtiaz = Rs 32,693 | Electric Bill = Rs 5,128',
    '• February Highlights: Seasonal Shopping Event = Rs 15,000'
]

# Function to build a clean, self-contained year sheet
def build_year_sheet(wb, sheet_name, data_dict, salary_list, notes_list):
    ws = wb.add_worksheet(sheet_name)
    ws.hide_gridlines(0)
    
    # Column Widths
    ws.set_column('A:A', 23)   # Category
    for c in range(1, 13):
        ws.set_column(c, c, 9.5) # Jan - Dec
    ws.set_column('N:N', 12.5) # Total
    ws.set_column('O:O', 11)   # Avg/Mo
    ws.set_column('P:P', 2.5)  # Spacer
    ws.set_column('Q:Z', 10.5) # Charts
    
    # 1. Top Header Banner
    ws.set_row(0, 26)
    ws.merge_range('A1:L1', f'  📊 {sheet_name} PERSONAL EXPENSE & BUDGET TRACKER', f_banner)
    ws.merge_range('M1:O1', f'Year {sheet_name} Dashboard', f_banner_tag)
    
    # 2. Four Premium KPI Cards (Row 3 & 4)
    ws.set_row(2, 14)
    ws.set_row(3, 22)
    
    # Income Card
    ws.merge_range('A3:C3', 'TOTAL INCOME (YTD)', f_card_inc_lbl)
    ws.merge_range('A4:C4', '=N23', f_card_inc_val)
    
    # Expense Card
    ws.merge_range('E3:G3', 'TOTAL EXPENSES (YTD)', f_card_exp_lbl)
    ws.merge_range('E4:G4', '=N22', f_card_exp_val)
    
    # Net Savings Card
    ws.merge_range('I3:K3', 'NET SAVINGS (YTD)', f_card_sav_lbl)
    ws.merge_range('I4:K4', '=N24', f_card_sav_val)
    
    # Savings Rate Card
    ws.merge_range('M3:O3', 'SAVINGS RATE %', f_card_rat_lbl)
    ws.merge_range('M4:O4', '=N25', f_card_rat_val)
    
    # 3. Table Header (Row 6)
    ws.set_row(5, 20)
    ws.write('A6', 'Expense Category', f_tbl_hdr_left)
    for idx, m in enumerate(MONTHS):
        ws.write(f'{COL_LETTERS[idx]}6', m, f_tbl_hdr_month)
    ws.write('N6', 'Total (YTD)', f_tbl_hdr_tot)
    ws.write('O6', 'Avg / Mo', f_tbl_hdr_tot)
    
    # 4. Data Rows (Rows 7 to 21)
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
        
    # 5. Summary Rows (Rows 22 to 25)
    # Row 22: Total Expenses
    ws.set_row(21, 20)
    ws.write('A22', 'TOTAL COST', f_row_exp_lbl)
    for idx in range(12):
        col = COL_LETTERS[idx]
        ws.write_formula(f'{col}22', f'=SUM({col}7:{col}21)', f_row_exp_val)
    ws.write_formula('N22', '=SUM(N7:N21)', f_row_exp_val)
    ws.write_formula('O22', '=AVERAGE(B22:M22)', f_row_exp_val)
    
    # Row 23: Salary / Income
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
        'format': workbook.add_format({'bg_color': '#DCFCE7', 'font_color': '#065F46', 'num_format': '#,##0'})
    })
    
    # 6. Notes & Context Section (Rows 27-31)
    ws.set_row(26, 18)
    ws.merge_range('A27:O27', f'  📌 MAJOR PURCHASES & FINANCIAL NOTES ({sheet_name})', f_notes_hdr)
    for n_idx, note_text in enumerate(notes_list):
        r_n = 28 + n_idx
        ws.set_row(r_n - 1, 16)
        ws.merge_range(f'A{r_n}:O{r_n}', f'  {note_text}', f_notes_body)
        
    # ==========================================
    # CHARTS (Configured with data labels & hover interactivity)
    # ==========================================
    # Chart 1: Monthly Cash Flow (Column Chart)
    chart1 = wb.add_chart({'type': 'column'})
    
    # Salary series (Emerald)
    chart1.add_series({
        'name':       f"='{sheet_name}'!$A$23",
        'categories': f"='{sheet_name}'!$B$6:$M$6",
        'values':     f"='{sheet_name}'!$B$23:$M$23",
        'fill':       {'color': '#10B981'},
        'border':     {'none': True}
    })
    
    # Total Cost series (Rose Red)
    chart1.add_series({
        'name':       f"='{sheet_name}'!$A$22",
        'categories': f"='{sheet_name}'!$B$6:$M$6",
        'values':     f"='{sheet_name}'!$B$22:$M$22",
        'fill':       {'color': '#F43F5E'},
        'border':     {'none': True}
    })
    
    # Net Savings series (Sky Blue)
    chart1.add_series({
        'name':       f"='{sheet_name}'!$A$24",
        'categories': f"='{sheet_name}'!$B$6:$M$6",
        'values':     f"='{sheet_name}'!$B$24:$M$24",
        'fill':       {'color': '#0EA5E9'},
        'border':     {'none': True}
    })
    
    chart1.set_title({
        'name': 'Monthly Cash Flow: Income vs Expenses vs Net Savings',
        'name_font': {'size': 11, 'bold': True, 'name': FONT, 'color': C_DARK_NAVY}
    })
    chart1.set_x_axis({'name_font': {'size': 9, 'name': FONT}, 'num_font': {'size': 8, 'name': FONT}})
    chart1.set_y_axis({
        'name_font': {'size': 9, 'name': FONT},
        'num_font': {'size': 8, 'name': FONT},
        'major_gridlines': {'visible': True, 'line': {'color': '#E2E8F0'}}
    })
    chart1.set_legend({'position': 'top', 'font': {'size': 8.5, 'name': FONT}})
    chart1.set_size({'width': 520, 'height': 240})
    chart1.set_chartarea({'border': {'color': '#CBD5E1'}})
    ws.insert_chart('Q2', chart1)
    
    # Chart 2: Category Donut Chart (With percentages & labels on hover/display)
    chart2 = wb.add_chart({'type': 'doughnut'})
    chart2.add_series({
        'name':       'Spending by Category',
        'categories': f"='{sheet_name}'!$A$7:$A$21",
        'values':     f"='{sheet_name}'!$N$7:$N$21",
        'data_labels': {
            'percentage': True,
            'leader_lines': True,
            'font': {'size': 8, 'name': FONT, 'bold': True}
        },
        'points': [
            {'fill': {'color': '#8B5CF6'}}, # Office Lunch (Purple)
            {'fill': {'color': '#EC4899'}}, # Grocery (Pink)
            {'fill': {'color': '#F43F5E'}}, # Fun (Rose)
            {'fill': {'color': '#14B8A6'}}, # Electric Bill (Teal)
            {'fill': {'color': '#94A3B8'}}, # Phone Bill (Slate)
            {'fill': {'color': '#CBD5E1'}}, # Water Bill (Light Slate)
            {'fill': {'color': '#06B6D4'}}, # Gas Bill (Cyan)
            {'fill': {'color': '#E2E8F0'}}, # Sadka (Muted)
            {'fill': {'color': '#3B82F6'}}, # Bike Maint (Blue)
            {'fill': {'color': '#F59E0B'}}, # Petrol (Amber)
            {'fill': {'color': '#6366F1'}}, # Shopping (Indigo)
            {'fill': {'color': '#0EA5E9'}}, # Mobile Data (Sky)
            {'fill': {'color': '#84CC16'}}, # Hair Cut (Lime)
            {'fill': {'color': '#64748B'}}, # Others (Muted Slate)
            {'fill': {'color': '#10B981'}}, # Food (Emerald)
        ]
    })
    chart2.set_title({
        'name': 'Spending Share by Category (% Breakdown)',
        'name_font': {'size': 11, 'bold': True, 'name': FONT, 'color': C_DARK_NAVY}
    })
    chart2.set_legend({'position': 'right', 'font': {'size': 8, 'name': FONT}})
    chart2.set_hole_size(45)
    chart2.set_size({'width': 520, 'height': 230})
    chart2.set_chartarea({'border': {'color': '#CBD5E1'}})
    ws.insert_chart('Q14', chart2)


# ==============================================================================
# BUILD SHEETS: 2026, 2027, 2028 (NO EXTRA COMPLEX DASHBOARD TAB)
# ==============================================================================
build_year_sheet(workbook, '2026', DATA_2026, SALARY_2026, NOTES_2026)

# Blank templates for future years
DATA_BLANK = {cat: [0]*12 for cat in CATEGORIES}
SALARY_BLANK = [0]*12
NOTES_BLANK = [
    '• Enter your one-off expenses and financial notes here.',
    '• All calculations, totals, and charts update automatically as you enter numbers.'
]
build_year_sheet(workbook, '2027', DATA_BLANK, SALARY_BLANK, NOTES_BLANK)
build_year_sheet(workbook, '2028', DATA_BLANK, SALARY_BLANK, NOTES_BLANK)

workbook.close()
print("Generated Expense_Temp.xlsx successfully.")

# Replace Expense_New.xlsx with updated sleek version
try:
    shutil.copyfile(temp_file, final_file)
    os.remove(temp_file)
    print("Updated Expense_New.xlsx successfully!")
except Exception as e:
    print("Notice on replacing Expense_New.xlsx:", e)
