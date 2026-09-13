import xlsxwriter
import os

target_file = r'C:\Users\anasq\OneDrive\Desktop\Budget\Expense.xlsx'

workbook = xlsxwriter.Workbook(target_file)

# ==========================================
# PALETTES & FORMAT DEFINITIONS
# ==========================================
C_DARK_NAVY   = '#0F172A'  # Slate 900
C_HEADER_BG   = '#1E293B'  # Slate 800
C_SECTION_BG  = '#334155'  # Slate 700
C_ACCENT_TEAL = '#0D9488'  # Teal 600
C_ACCENT_BLUE = '#0284C7'  # Sky 600
C_LIGHT_BG    = '#F8FAFC'  # Slate 50
C_ALT_ROW     = '#F1F5F9'  # Slate 100
C_BORDER      = '#CBD5E1'  # Slate 300
C_BORDER_DARK = '#64748B'  # Slate 500

C_SUCCESS_BG  = '#ECFDF5'  # Emerald 50
C_SUCCESS_TXT = '#065F46'  # Emerald 800
C_DANGER_BG   = '#FEF2F2'  # Red 50
C_DANGER_TXT  = '#991B1B'  # Red 800

FONT = 'Segoe UI'

# Base Title Formats
f_title = workbook.add_format({
    'bold': True, 'font_size': 16, 'font_color': '#FFFFFF',
    'bg_color': C_DARK_NAVY, 'align': 'left', 'valign': 'vcenter',
    'font_name': FONT
})

f_subtitle = workbook.add_format({
    'font_size': 10, 'font_color': '#94A3B8', 'bg_color': C_DARK_NAVY,
    'align': 'left', 'valign': 'vcenter', 'font_name': FONT, 'italic': True
})

# Card Formats
f_card_label = workbook.add_format({
    'font_size': 9, 'bold': True, 'font_color': '#475569', 'bg_color': '#FFFFFF',
    'align': 'center', 'valign': 'vcenter', 'font_name': FONT,
    'top': 1, 'left': 1, 'right': 1, 'top_color': C_BORDER, 'left_color': C_BORDER, 'right_color': C_BORDER
})

f_card_val_curr = workbook.add_format({
    'font_size': 14, 'bold': True, 'font_color': C_DARK_NAVY, 'bg_color': '#FFFFFF',
    'align': 'center', 'valign': 'vcenter', 'font_name': FONT,
    'num_format': 'Rs #,##0',
    'bottom': 1, 'left': 1, 'right': 1, 'bottom_color': C_BORDER, 'left_color': C_BORDER, 'right_color': C_BORDER
})

f_card_val_green = workbook.add_format({
    'font_size': 14, 'bold': True, 'font_color': '#059669', 'bg_color': '#FFFFFF',
    'align': 'center', 'valign': 'vcenter', 'font_name': FONT,
    'num_format': 'Rs #,##0',
    'bottom': 1, 'left': 1, 'right': 1, 'bottom_color': C_BORDER, 'left_color': C_BORDER, 'right_color': C_BORDER
})

f_card_val_red = workbook.add_format({
    'font_size': 14, 'bold': True, 'font_color': '#DC2626', 'bg_color': '#FFFFFF',
    'align': 'center', 'valign': 'vcenter', 'font_name': FONT,
    'num_format': 'Rs #,##0',
    'bottom': 1, 'left': 1, 'right': 1, 'bottom_color': C_BORDER, 'left_color': C_BORDER, 'right_color': C_BORDER
})

f_card_val_pct = workbook.add_format({
    'font_size': 14, 'bold': True, 'font_color': C_ACCENT_TEAL, 'bg_color': '#FFFFFF',
    'align': 'center', 'valign': 'vcenter', 'font_name': FONT,
    'num_format': '0.0%',
    'bottom': 1, 'left': 1, 'right': 1, 'bottom_color': C_BORDER, 'left_color': C_BORDER, 'right_color': C_BORDER
})

# Table Headers
f_tbl_hdr = workbook.add_format({
    'bold': True, 'font_size': 10, 'font_color': '#FFFFFF', 'bg_color': C_HEADER_BG,
    'align': 'center', 'valign': 'vcenter', 'font_name': FONT,
    'border': 1, 'border_color': C_BORDER_DARK, 'text_wrap': True
})

f_tbl_hdr_left = workbook.add_format({
    'bold': True, 'font_size': 10, 'font_color': '#FFFFFF', 'bg_color': C_HEADER_BG,
    'align': 'left', 'valign': 'vcenter', 'font_name': FONT,
    'border': 1, 'border_color': C_BORDER_DARK
})

f_tbl_hdr_accent = workbook.add_format({
    'bold': True, 'font_size': 10, 'font_color': '#FFFFFF', 'bg_color': C_ACCENT_TEAL,
    'align': 'center', 'valign': 'vcenter', 'font_name': FONT,
    'border': 1, 'border_color': C_BORDER_DARK
})

# Section Header
f_section_hdr = workbook.add_format({
    'bold': True, 'font_size': 10, 'font_color': '#FFFFFF', 'bg_color': C_SECTION_BG,
    'align': 'left', 'valign': 'vcenter', 'font_name': FONT,
    'border': 1, 'border_color': C_BORDER
})

# Data Cells
f_data_text = workbook.add_format({
    'font_size': 10, 'font_name': FONT, 'font_color': '#1E293B',
    'align': 'left', 'valign': 'vcenter', 'border': 1, 'border_color': C_BORDER
})

f_data_text_alt = workbook.add_format({
    'font_size': 10, 'font_name': FONT, 'font_color': '#1E293B', 'bg_color': C_ALT_ROW,
    'align': 'left', 'valign': 'vcenter', 'border': 1, 'border_color': C_BORDER
})

f_data_center = workbook.add_format({
    'font_size': 10, 'font_name': FONT, 'font_color': '#1E293B',
    'align': 'center', 'valign': 'vcenter', 'border': 1, 'border_color': C_BORDER
})

f_data_center_alt = workbook.add_format({
    'font_size': 10, 'font_name': FONT, 'font_color': '#1E293B', 'bg_color': C_ALT_ROW,
    'align': 'center', 'valign': 'vcenter', 'border': 1, 'border_color': C_BORDER
})

f_data_curr = workbook.add_format({
    'font_size': 10, 'font_name': FONT, 'font_color': '#1E293B',
    'align': 'right', 'valign': 'vcenter', 'border': 1, 'border_color': C_BORDER,
    'num_format': '#,##0'
})

f_data_curr_alt = workbook.add_format({
    'font_size': 10, 'font_name': FONT, 'font_color': '#1E293B', 'bg_color': C_ALT_ROW,
    'align': 'right', 'valign': 'vcenter', 'border': 1, 'border_color': C_BORDER,
    'num_format': '#,##0'
})

f_data_curr_bold = workbook.add_format({
    'bold': True, 'font_size': 10, 'font_name': FONT, 'font_color': C_DARK_NAVY,
    'align': 'right', 'valign': 'vcenter', 'border': 1, 'border_color': C_BORDER,
    'num_format': 'Rs #,##0'
})

f_data_pct = workbook.add_format({
    'font_size': 10, 'font_name': FONT, 'font_color': '#1E293B',
    'align': 'right', 'valign': 'vcenter', 'border': 1, 'border_color': C_BORDER,
    'num_format': '0.0%'
})

f_data_pct_alt = workbook.add_format({
    'font_size': 10, 'font_name': FONT, 'font_color': '#1E293B', 'bg_color': C_ALT_ROW,
    'align': 'right', 'valign': 'vcenter', 'border': 1, 'border_color': C_BORDER,
    'num_format': '0.0%'
})

# Summary Rows Formats
f_total_exp_lbl = workbook.add_format({
    'bold': True, 'font_size': 10, 'font_name': FONT, 'font_color': '#991B1B', 'bg_color': '#FEE2E2',
    'align': 'left', 'valign': 'vcenter', 'top': 2, 'bottom': 1, 'top_color': '#DC2626', 'bottom_color': C_BORDER,
    'left': 1, 'right': 1, 'left_color': C_BORDER, 'right_color': C_BORDER
})

f_total_exp_val = workbook.add_format({
    'bold': True, 'font_size': 10, 'font_name': FONT, 'font_color': '#991B1B', 'bg_color': '#FEE2E2',
    'align': 'right', 'valign': 'vcenter', 'top': 2, 'bottom': 1, 'top_color': '#DC2626', 'bottom_color': C_BORDER,
    'left': 1, 'right': 1, 'left_color': C_BORDER, 'right_color': C_BORDER,
    'num_format': 'Rs #,##0'
})

f_total_pct_val = workbook.add_format({
    'bold': True, 'font_size': 10, 'font_name': FONT, 'font_color': '#991B1B', 'bg_color': '#FEE2E2',
    'align': 'right', 'valign': 'vcenter', 'top': 2, 'bottom': 1, 'top_color': '#DC2626', 'bottom_color': C_BORDER,
    'left': 1, 'right': 1, 'left_color': C_BORDER, 'right_color': C_BORDER,
    'num_format': '0.0%'
})

f_salary_lbl = workbook.add_format({
    'bold': True, 'font_size': 10, 'font_name': FONT, 'font_color': '#065F46', 'bg_color': '#D1FAE5',
    'align': 'left', 'valign': 'vcenter', 'border': 1, 'border_color': C_BORDER
})

f_salary_val = workbook.add_format({
    'bold': True, 'font_size': 10, 'font_name': FONT, 'font_color': '#065F46', 'bg_color': '#D1FAE5',
    'align': 'right', 'valign': 'vcenter', 'border': 1, 'border_color': C_BORDER,
    'num_format': 'Rs #,##0'
})

f_saving_lbl = workbook.add_format({
    'bold': True, 'font_size': 10, 'font_name': FONT, 'font_color': C_DARK_NAVY, 'bg_color': '#E0F2FE',
    'align': 'left', 'valign': 'vcenter', 'border': 1, 'border_color': C_BORDER
})

f_saving_val = workbook.add_format({
    'bold': True, 'font_size': 10, 'font_name': FONT, 'font_color': C_DARK_NAVY, 'bg_color': '#E0F2FE',
    'align': 'right', 'valign': 'vcenter', 'border': 1, 'border_color': C_BORDER,
    'num_format': 'Rs #,##0'
})

f_rate_lbl = workbook.add_format({
    'bold': True, 'font_size': 10, 'font_name': FONT, 'font_color': '#475569', 'bg_color': C_LIGHT_BG,
    'align': 'left', 'valign': 'vcenter', 'border': 1, 'border_color': C_BORDER
})

f_rate_val = workbook.add_format({
    'bold': True, 'font_size': 10, 'font_name': FONT, 'font_color': '#475569', 'bg_color': C_LIGHT_BG,
    'align': 'right', 'valign': 'vcenter', 'border': 1, 'border_color': C_BORDER,
    'num_format': '0.0%'
})

f_cum_lbl = workbook.add_format({
    'bold': True, 'font_size': 10, 'font_name': FONT, 'font_color': '#FFFFFF', 'bg_color': C_HEADER_BG,
    'align': 'left', 'valign': 'vcenter', 'top': 1, 'bottom': 2, 'top_color': C_BORDER, 'bottom_color': C_DARK_NAVY,
    'left': 1, 'right': 1, 'left_color': C_BORDER, 'right_color': C_BORDER
})

f_cum_val = workbook.add_format({
    'bold': True, 'font_size': 10, 'font_name': FONT, 'font_color': '#FFFFFF', 'bg_color': C_HEADER_BG,
    'align': 'right', 'valign': 'vcenter', 'top': 1, 'bottom': 2, 'top_color': C_BORDER, 'bottom_color': C_DARK_NAVY,
    'left': 1, 'right': 1, 'left_color': C_BORDER, 'right_color': C_BORDER,
    'num_format': 'Rs #,##0'
})

# Months List
MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
COL_LETTERS = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N']

# Data Matrix from Original Expense File
CATEGORIES_CONFIG = [
    {
        'group': 'Household & Utilities',
        'items': [
            ('Monthly Grocery-Imtiaz', [0, 0, 0, 0, 0, 0, 0, 32693, 0, 0, 0, 0]),
            ('Electric Bill',          [0, 0, 0, 0, 0, 0, 0,  5128, 0, 0, 0, 0]),
            ('Gas Bill',               [0, 0, 0, 0, 0, 0, 0,  1250, 0, 0, 0, 0]),
            ('Water Bill',             [0, 0, 0, 0, 0, 0, 0,     0, 0, 0, 0, 0]),
            ('Phone Bill',             [0, 0, 0, 0, 0, 0, 0,     0, 0, 0, 0, 0]),
        ]
    },
    {
        'group': 'Transportation & Commute',
        'items': [
            ('Petrol',                 [1000, 3000, 3450, 6570, 4000, 6000, 3000, 5000, 0, 0, 0, 0]),
            ('Bike Maintenance',       [   0,    0,    0, 1530,  120,    0, 8050,  850, 0, 0, 0, 0]),
        ]
    },
    {
        'group': 'Food & Dining',
        'items': [
            ('Food',                   [ 100,    0, 2500, 1140,    0, 1030, 1570, 4700, 0, 0, 0, 0]),
            ('Office Lunch',           [   0,    0,  500, 1350, 1150,    0, 2290, 3000, 0, 0, 0, 0]),
        ]
    },
    {
        'group': 'Lifestyle & Personal Care',
        'items': [
            ('Shopping',               [   0, 15000,   0, 2500,  250,  100, 63200, 2850,    0, 0, 0, 0]),
            ('Fun',                    [   0,     0,   0,    0,    0,    0,     0, 3887, 1044, 0, 0, 0]),
            ('Mobile Data',            [   0,     0, 500, 1000,  810, 1350,  1350, 1080,    0, 0, 0, 0]),
            ('Hair Cut',               [   0,   300, 400,  300,  300,    0,   300,  300,  300, 0, 0, 0]),
        ]
    },
    {
        'group': 'Giving & Miscellaneous',
        'items': [
            ('Sadka',                  [   0, 0, 0,     0,     0,     0,     0,     0, 0, 0, 0, 0]),
            ('Others',                 [   0, 0, 0,     0,     0,     0,     0,     0, 0, 0, 0, 0]),
        ]
    }
]

SALARY_DATA = [0, 0, 0, 33320, 25000, 24194, 27500, 86000, 0, 0, 0, 0]

# Monthly Budget Targets (Estimates & Benchmarks)
BUDGET_TARGETS = {
    'Monthly Grocery-Imtiaz': 25000,
    'Electric Bill': 5000,
    'Gas Bill': 1500,
    'Water Bill': 1000,
    'Phone Bill': 1000,
    'Petrol': 5000,
    'Bike Maintenance': 2000,
    'Food': 3000,
    'Office Lunch': 2500,
    'Shopping': 5000,
    'Fun': 2500,
    'Mobile Data': 1200,
    'Hair Cut': 400,
    'Sadka': 2000,
    'Others': 2000,
}

# Dynamic Tracker Row Mapping
tracker_cur = 5
cat_to_tracker_row = {}
tracker_cat_rows = []

for g in CATEGORIES_CONFIG:
    tracker_cur += 1  # Group Header row
    for cat_name, _ in g['items']:
        cat_to_tracker_row[cat_name] = tracker_cur
        tracker_cat_rows.append(tracker_cur)
        tracker_cur += 1

TRACKER_TOTAL_EXP_ROW = tracker_cur      # Row 25
TRACKER_SALARY_ROW    = tracker_cur + 1  # Row 26
TRACKER_SAVING_ROW    = tracker_cur + 2  # Row 27
TRACKER_RATE_ROW      = tracker_cur + 3  # Row 28
TRACKER_CUM_ROW       = tracker_cur + 4  # Row 29

# ==============================================================================
# SHEET 1: Executive Dashboard
# ==============================================================================
ws_dash = workbook.add_worksheet('Executive Dashboard')
ws_dash.hide_gridlines(0)

# Banner
ws_dash.set_row(0, 30)
ws_dash.set_row(1, 18)
ws_dash.merge_range('B1:Q1', '  2026 PERSONAL BUDGET & FINANCIAL INTELLIGENCE DASHBOARD', f_title)
ws_dash.merge_range('B2:Q2', '  Executive Cash Flow, Expense Analytics, Budget Tracking & Savings Trajectory', f_subtitle)

# Column Widths
ws_dash.set_column('A:A', 3)
ws_dash.set_column('B:B', 15)  # Month / Metric
ws_dash.set_column('C:C', 15)  # Income
ws_dash.set_column('D:D', 15)  # Expenses
ws_dash.set_column('E:E', 15)  # Net Savings
ws_dash.set_column('F:F', 14)  # Savings Rate
ws_dash.set_column('G:G', 14)  # Status
ws_dash.set_column('H:H', 4)   # Spacer
ws_dash.set_column('I:Q', 13)  # Charts Area

# 5 KPI Summary Cards (Rows 4-5)
ws_dash.set_row(3, 16)
ws_dash.set_row(4, 28)

ws_dash.merge_range('B4:C4', 'TOTAL INCOME (YTD)', f_card_label)
ws_dash.merge_range('B5:C5', f"='Monthly Tracker'!O{TRACKER_SALARY_ROW}", f_card_val_green)

ws_dash.merge_range('D4:E4', 'TOTAL EXPENSES (YTD)', f_card_label)
ws_dash.merge_range('D5:E5', f"='Monthly Tracker'!O{TRACKER_TOTAL_EXP_ROW}", f_card_val_red)

ws_dash.merge_range('F4:G4', 'NET SAVINGS (YTD)', f_card_label)
ws_dash.merge_range('F5:G5', f"='Monthly Tracker'!O{TRACKER_SAVING_ROW}", f_card_val_curr)

ws_dash.merge_range('I4:J4', 'SAVINGS RATE %', f_card_label)
ws_dash.merge_range('I5:J5', f"='Monthly Tracker'!O{TRACKER_RATE_ROW}", f_card_val_pct)

ws_dash.merge_range('K4:L4', 'AVG MONTHLY EXPENSE', f_card_label)
ws_dash.merge_range('K5:L5', f"='Monthly Tracker'!P{TRACKER_TOTAL_EXP_ROW}", f_card_val_curr)

# Monthly Cashflow Table (Rows 8 to 20)
ws_dash.set_row(7, 24)
ws_dash.write('B8', 'Month', f_tbl_hdr_left)
ws_dash.write('C8', 'Income', f_tbl_hdr)
ws_dash.write('D8', 'Expenses', f_tbl_hdr)
ws_dash.write('E8', 'Net Savings', f_tbl_hdr)
ws_dash.write('F8', 'Savings Rate', f_tbl_hdr)
ws_dash.write('G8', 'Cash Flow Status', f_tbl_hdr)

for idx, month in enumerate(MONTHS):
    row_num = 9 + idx
    ws_dash.set_row(row_num - 1, 19)
    col_l = COL_LETTERS[idx]
    
    f_t = f_data_text if idx % 2 == 0 else f_data_text_alt
    f_n = f_data_curr if idx % 2 == 0 else f_data_curr_alt
    f_p = f_data_pct if idx % 2 == 0 else f_data_pct_alt
    f_c = f_data_center if idx % 2 == 0 else f_data_center_alt
    
    ws_dash.write(f'B{row_num}', month, f_t)
    ws_dash.write_formula(f'C{row_num}', f"='Monthly Tracker'!{col_l}{TRACKER_SALARY_ROW}", f_n)
    ws_dash.write_formula(f'D{row_num}', f"='Monthly Tracker'!{col_l}{TRACKER_TOTAL_EXP_ROW}", f_n)
    ws_dash.write_formula(f'E{row_num}', f"=C{row_num}-D{row_num}", f_n)
    ws_dash.write_formula(f'F{row_num}', f"=IF(C{row_num}>0, E{row_num}/C{row_num}, 0)", f_p)
    ws_dash.write_formula(f'G{row_num}', f'=IF(C{row_num}=0, IF(D{row_num}=0,"⚪ No Data","🔴 Deficit"), IF(E{row_num}>=0, "🟢 Surplus", "🔴 Deficit"))', f_c)

# Total YTD Row
ws_dash.set_row(21, 22)
ws_dash.write('B22', 'Total (YTD)', f_total_exp_lbl)
ws_dash.write_formula('C22', '=SUM(C9:C20)', f_salary_val)
ws_dash.write_formula('D22', '=SUM(D9:D20)', f_total_exp_val)
ws_dash.write_formula('E22', '=SUM(E9:E20)', f_saving_val)
ws_dash.write_formula('F22', '=IF(C22>0, E22/C22, 0)', f_card_val_pct)
ws_dash.write_formula('G22', '=IF(E22>=0, "🟢 Net Surplus", "🔴 Net Deficit")', f_card_label)

# Average Row
ws_dash.set_row(22, 20)
ws_dash.write('B23', 'Monthly Average', f_section_hdr)
ws_dash.write_formula('C23', '=AVERAGE(C9:C20)', f_data_curr_bold)
ws_dash.write_formula('D23', '=AVERAGE(D9:D20)', f_data_curr_bold)
ws_dash.write_formula('E23', '=AVERAGE(E9:E20)', f_data_curr_bold)
ws_dash.write_formula('F23', '=AVERAGE(F9:F20)', f_data_pct)
ws_dash.write('G23', '-', f_data_center)

# Conditional Formatting on Net Savings
ws_dash.conditional_format('E9:E20', {
    'type': 'cell', 'criteria': '<', 'value': 0,
    'format': workbook.add_format({'bg_color': C_DANGER_BG, 'font_color': C_DANGER_TXT, 'num_format': '#,##0'})
})
ws_dash.conditional_format('E9:E20', {
    'type': 'cell', 'criteria': '>', 'value': 0,
    'format': workbook.add_format({'bg_color': C_SUCCESS_BG, 'font_color': C_SUCCESS_TXT, 'num_format': '#,##0'})
})

# Chart 1: Cash Flow Column Chart
chart_cashflow = workbook.add_chart({'type': 'column'})
chart_cashflow.add_series({
    'name':       "='Executive Dashboard'!$C$8",
    'categories': "='Executive Dashboard'!$B$9:$B$20",
    'values':     "='Executive Dashboard'!$C$9:$C$20",
    'fill':       {'color': '#10B981'},  # Emerald
    'border':     {'none': True}
})
chart_cashflow.add_series({
    'name':       "='Executive Dashboard'!$D$8",
    'categories': "='Executive Dashboard'!$B$9:$B$20",
    'values':     "='Executive Dashboard'!$D$9:$D$20",
    'fill':       {'color': '#F43F5E'},  # Red
    'border':     {'none': True}
})
chart_cashflow.add_series({
    'name':       "='Executive Dashboard'!$E$8",
    'categories': "='Executive Dashboard'!$B$9:$B$20",
    'values':     "='Executive Dashboard'!$E$9:$E$20",
    'fill':       {'color': '#0284C7'},  # Blue
    'border':     {'none': True}
})
chart_cashflow.set_title({'name': 'Monthly Cash Flow: Income vs Expenses vs Net Savings', 'name_font': {'size': 12, 'bold': True, 'name': FONT}})
chart_cashflow.set_x_axis({'name': 'Month', 'name_font': {'size': 9, 'name': FONT}, 'num_font': {'size': 9, 'name': FONT}})
chart_cashflow.set_y_axis({'name': 'Amount (PKR)', 'name_font': {'size': 9, 'name': FONT}, 'num_font': {'size': 9, 'name': FONT}, 'major_gridlines': {'visible': True, 'line': {'color': '#E2E8F0'}}})
chart_cashflow.set_legend({'position': 'top'})
chart_cashflow.set_size({'width': 660, 'height': 340})
chart_cashflow.set_chartarea({'border': {'color': '#CBD5E1'}})
ws_dash.insert_chart('I7', chart_cashflow)

# Section 2: Annual Expense Breakdown by Category
ws_dash.set_row(25, 24)
ws_dash.merge_range('B26:G26', '  ANNUAL EXPENSE BREAKDOWN BY CATEGORY', f_section_hdr)

ws_dash.set_row(26, 20)
ws_dash.write('B27', 'Expense Category', f_tbl_hdr_left)
ws_dash.write('C27', 'Category Group', f_tbl_hdr_left)
ws_dash.write('D27', 'Total Spent (YTD)', f_tbl_hdr_accent)
ws_dash.write('E27', '% Share', f_tbl_hdr)
ws_dash.write('F27', 'Monthly Avg', f_tbl_hdr)
ws_dash.write('G27', 'Target Budget', f_tbl_hdr)

cat_flat = []
for g in CATEGORIES_CONFIG:
    for cat_name, _ in g['items']:
        cat_flat.append((cat_name, g['group']))

for idx, (c_name, c_grp) in enumerate(cat_flat):
    r_idx = 28 + idx
    ws_dash.set_row(r_idx - 1, 18)
    f_t = f_data_text if idx % 2 == 0 else f_data_text_alt
    f_n = f_data_curr if idx % 2 == 0 else f_data_curr_alt
    f_p = f_data_pct if idx % 2 == 0 else f_data_pct_alt
    
    t_row = cat_to_tracker_row[c_name]
    
    ws_dash.write(f'B{r_idx}', c_name, f_t)
    ws_dash.write(f'C{r_idx}', c_grp, f_t)
    ws_dash.write_formula(f'D{r_idx}', f"='Monthly Tracker'!O{t_row}", f_n)
    ws_dash.write_formula(f'E{r_idx}', f"=IF($D$22>0, D{r_idx}/$D$22, 0)", f_p)
    ws_dash.write_formula(f'F{r_idx}', f"='Monthly Tracker'!P{t_row}", f_n)
    ws_dash.write(f'G{r_idx}', BUDGET_TARGETS.get(c_name, 0), f_n)

# Data bars on Category Spend
ws_dash.conditional_format(f'D28:D{27+len(cat_flat)}', {
    'type': 'data_bar', 'bar_color': '#38BDF8', 'bar_solid': True
})

# Chart 2: Category Donut Chart
chart_donut = workbook.add_chart({'type': 'doughnut'})
chart_donut.add_series({
    'name':       'Expense Distribution',
    'categories': f"='Executive Dashboard'!$B$28:$B${27+len(cat_flat)}",
    'values':     f"='Executive Dashboard'!$D$28:$D${27+len(cat_flat)}",
    'points': [
        {'fill': {'color': '#EC4899'}},  # Grocery (Pink)
        {'fill': {'color': '#14B8A6'}},  # Electric (Teal)
        {'fill': {'color': '#06B6D4'}},  # Gas (Cyan)
        {'fill': {'color': '#94A3B8'}},  # Water (Slate)
        {'fill': {'color': '#CBD5E1'}},  # Phone (Light Slate)
        {'fill': {'color': '#F59E0B'}},  # Petrol (Amber)
        {'fill': {'color': '#3B82F6'}},  # Bike Maint (Blue)
        {'fill': {'color': '#10B981'}},  # Food (Emerald)
        {'fill': {'color': '#8B5CF6'}},  # Office Lunch (Purple)
        {'fill': {'color': '#6366F1'}},  # Shopping (Indigo)
        {'fill': {'color': '#F43F5E'}},  # Fun (Rose)
        {'fill': {'color': '#0EA5E9'}},  # Mobile Data (Sky)
        {'fill': {'color': '#84CC16'}},  # Hair Cut (Lime)
    ]
})
chart_donut.set_title({'name': 'Expense Distribution by Category', 'name_font': {'size': 12, 'bold': True, 'name': FONT}})
chart_donut.set_legend({'position': 'right', 'font': {'size': 9, 'name': FONT}})
chart_donut.set_hole_size(50)
chart_donut.set_size({'width': 420, 'height': 310})
chart_donut.set_chartarea({'border': {'color': '#CBD5E1'}})
ws_dash.insert_chart('I26', chart_donut)

# Chart 3: Ranked Category Bar Chart
chart_bar = workbook.add_chart({'type': 'bar'})
chart_bar.add_series({
    'name':       'Total Amount Spent',
    'categories': f"='Executive Dashboard'!$B$28:$B${27+len(cat_flat)}",
    'values':     f"='Executive Dashboard'!$D$28:$D${27+len(cat_flat)}",
    'fill':       {'color': '#0D9488'},
    'border':     {'none': True}
})
chart_bar.set_title({'name': 'Category Spending Comparison', 'name_font': {'size': 12, 'bold': True, 'name': FONT}})
chart_bar.set_x_axis({'name': 'Total Spent (PKR)', 'name_font': {'size': 9, 'name': FONT}, 'major_gridlines': {'visible': True, 'line': {'color': '#E2E8F0'}}})
chart_bar.set_y_axis({'reverse': True, 'name_font': {'size': 9, 'name': FONT}, 'num_font': {'size': 9, 'name': FONT}})
chart_bar.set_legend({'none': True})
chart_bar.set_size({'width': 440, 'height': 310})
chart_bar.set_chartarea({'border': {'color': '#CBD5E1'}})
ws_dash.insert_chart('M26', chart_bar)


# ==============================================================================
# SHEET 2: Monthly Tracker
# ==============================================================================
ws_track = workbook.add_worksheet('Monthly Tracker')
ws_track.hide_gridlines(0)
ws_track.freeze_panes(4, 2)

# Title
ws_track.set_row(0, 28)
ws_track.set_row(1, 16)
ws_track.merge_range('B1:Q1', '  2026 MASTER MONTHLY EXPENSE TRACKER', f_title)
ws_track.merge_range('B2:Q2', '  Detailed Month-by-Month Categorized Spending Matrix & Cash Flow', f_subtitle)

# Column Widths
ws_track.set_column('A:A', 3)
ws_track.set_column('B:B', 26)  # Category Name
for c_idx in range(2, 14):
    ws_track.set_column(c_idx, c_idx, 12)  # Jan - Dec
ws_track.set_column('O:O', 15)  # Total YTD
ws_track.set_column('P:P', 13)  # Monthly Avg
ws_track.set_column('Q:Q', 11)  # % of Total

# Table Headers
ws_track.set_row(3, 26)
ws_track.write('B4', 'Expense Category', f_tbl_hdr_left)
for idx, month in enumerate(MONTHS):
    col_l = COL_LETTERS[idx]
    ws_track.write(f'{col_l}4', month, f_tbl_hdr)
ws_track.write('O4', 'Total (YTD)', f_tbl_hdr_accent)
ws_track.write('P4', 'Monthly Avg', f_tbl_hdr)
ws_track.write('Q4', '% of Total', f_tbl_hdr)

row_pointer = 5
cat_idx = 0

for grp in CATEGORIES_CONFIG:
    ws_track.set_row(row_pointer - 1, 20)
    ws_track.merge_range(f'B{row_pointer}:Q{row_pointer}', f"  {grp['group']}", f_section_hdr)
    row_pointer += 1
    
    for cat_name, monthly_vals in grp['items']:
        ws_track.set_row(row_pointer - 1, 19)
        is_even = (cat_idx % 2 == 0)
        f_t = f_data_text if is_even else f_data_text_alt
        f_n = f_data_curr if is_even else f_data_curr_alt
        f_p = f_data_pct if is_even else f_data_pct_alt
        f_nb = f_data_curr_bold
        
        ws_track.write(f'B{row_pointer}', cat_name, f_t)
        
        for m_idx, val in enumerate(monthly_vals):
            col_l = COL_LETTERS[m_idx]
            ws_track.write(f'{col_l}{row_pointer}', val, f_n)
            
        ws_track.write_formula(f'O{row_pointer}', f'=SUM(C{row_pointer}:N{row_pointer})', f_nb)
        ws_track.write_formula(f'P{row_pointer}', f'=AVERAGE(C{row_pointer}:N{row_pointer})', f_n)
        ws_track.write_formula(f'Q{row_pointer}', f'=IF($O${TRACKER_TOTAL_EXP_ROW}>0, O{row_pointer}/$O${TRACKER_TOTAL_EXP_ROW}, 0)', f_p)
        
        row_pointer += 1
        cat_idx += 1

# Bottom Summary Rows
# Total Expenses
ws_track.set_row(TRACKER_TOTAL_EXP_ROW - 1, 24)
ws_track.write(f'B{TRACKER_TOTAL_EXP_ROW}', 'TOTAL EXPENSES', f_total_exp_lbl)

for m_idx in range(12):
    col_l = COL_LETTERS[m_idx]
    sum_items = [f"{col_l}{r}" for r in tracker_cat_rows]
    ws_track.write_formula(f'{col_l}{TRACKER_TOTAL_EXP_ROW}', f'=SUM({",".join(sum_items)})', f_total_exp_val)

ws_track.write_formula(f'O{TRACKER_TOTAL_EXP_ROW}', f'=SUM(O{tracker_cat_rows[0]}:O{tracker_cat_rows[-1]})', f_total_exp_val)
ws_track.write_formula(f'P{TRACKER_TOTAL_EXP_ROW}', f'=AVERAGE(C{TRACKER_TOTAL_EXP_ROW}:N{TRACKER_TOTAL_EXP_ROW})', f_total_exp_val)
ws_track.write(f'Q{TRACKER_TOTAL_EXP_ROW}', 1.0, f_total_pct_val)

# Salary / Income
ws_track.set_row(TRACKER_SALARY_ROW - 1, 22)
ws_track.write(f'B{TRACKER_SALARY_ROW}', 'SALARY / INCOME', f_salary_lbl)
for m_idx, s_val in enumerate(SALARY_DATA):
    col_l = COL_LETTERS[m_idx]
    ws_track.write(f'{col_l}{TRACKER_SALARY_ROW}', s_val, f_salary_val)
ws_track.write_formula(f'O{TRACKER_SALARY_ROW}', f'=SUM(C{TRACKER_SALARY_ROW}:N{TRACKER_SALARY_ROW})', f_salary_val)
ws_track.write_formula(f'P{TRACKER_SALARY_ROW}', f'=AVERAGE(C{TRACKER_SALARY_ROW}:N{TRACKER_SALARY_ROW})', f_salary_val)
ws_track.write(f'Q{TRACKER_SALARY_ROW}', '-', f_salary_val)

# Net Savings
ws_track.set_row(TRACKER_SAVING_ROW - 1, 22)
ws_track.write(f'B{TRACKER_SAVING_ROW}', 'NET SAVINGS (SURPLUS / DEFICIT)', f_saving_lbl)
for m_idx in range(12):
    col_l = COL_LETTERS[m_idx]
    ws_track.write_formula(f'{col_l}{TRACKER_SAVING_ROW}', f'={col_l}{TRACKER_SALARY_ROW}-{col_l}{TRACKER_TOTAL_EXP_ROW}', f_saving_val)
ws_track.write_formula(f'O{TRACKER_SAVING_ROW}', f'=O{TRACKER_SALARY_ROW}-O{TRACKER_TOTAL_EXP_ROW}', f_saving_val)
ws_track.write_formula(f'P{TRACKER_SAVING_ROW}', f'=AVERAGE(C{TRACKER_SAVING_ROW}:N{TRACKER_SAVING_ROW})', f_saving_val)
ws_track.write(f'Q{TRACKER_SAVING_ROW}', '-', f_saving_val)

# Savings Rate %
ws_track.set_row(TRACKER_RATE_ROW - 1, 20)
ws_track.write(f'B{TRACKER_RATE_ROW}', 'SAVINGS RATE %', f_rate_lbl)
for m_idx in range(12):
    col_l = COL_LETTERS[m_idx]
    ws_track.write_formula(f'{col_l}{TRACKER_RATE_ROW}', f'=IF({col_l}{TRACKER_SALARY_ROW}>0, {col_l}{TRACKER_SAVING_ROW}/{col_l}{TRACKER_SALARY_ROW}, 0)', f_rate_val)
ws_track.write_formula(f'O{TRACKER_RATE_ROW}', f'=IF(O{TRACKER_SALARY_ROW}>0, O{TRACKER_SAVING_ROW}/O{TRACKER_SALARY_ROW}, 0)', f_rate_val)
ws_track.write_formula(f'P{TRACKER_RATE_ROW}', f'=AVERAGE(C{TRACKER_RATE_ROW}:N{TRACKER_RATE_ROW})', f_rate_val)
ws_track.write(f'Q{TRACKER_RATE_ROW}', '-', f_rate_val)

# Cumulative Savings
ws_track.set_row(TRACKER_CUM_ROW - 1, 22)
ws_track.write(f'B{TRACKER_CUM_ROW}', 'CUMULATIVE SAVINGS BALANCE', f_cum_lbl)
ws_track.write_formula(f'C{TRACKER_CUM_ROW}', f'=C{TRACKER_SAVING_ROW}', f_cum_val)
for m_idx in range(1, 12):
    col_curr = COL_LETTERS[m_idx]
    col_prev = COL_LETTERS[m_idx - 1]
    ws_track.write_formula(f'{col_curr}{TRACKER_CUM_ROW}', f'={col_prev}{TRACKER_CUM_ROW}+{col_curr}{TRACKER_SAVING_ROW}', f_cum_val)
ws_track.write_formula(f'O{TRACKER_CUM_ROW}', f'=N{TRACKER_CUM_ROW}', f_cum_val)
ws_track.write(f'P{TRACKER_CUM_ROW}', '-', f_cum_val)
ws_track.write(f'Q{TRACKER_CUM_ROW}', '-', f_cum_val)

# Highlight high expense amounts (>10,000)
ws_track.conditional_format('C5:N24', {
    'type': 'cell', 'criteria': '>=', 'value': 10000,
    'format': workbook.add_format({'bg_color': '#FEF3C7', 'font_color': '#92400E'})
})

# Highlight Net Savings
ws_track.conditional_format(f'C{TRACKER_SAVING_ROW}:O{TRACKER_SAVING_ROW}', {
    'type': 'cell', 'criteria': '<', 'value': 0,
    'format': workbook.add_format({'bg_color': C_DANGER_BG, 'font_color': C_DANGER_TXT, 'num_format': 'Rs #,##0'})
})
ws_track.conditional_format(f'C{TRACKER_SAVING_ROW}:O{TRACKER_SAVING_ROW}', {
    'type': 'cell', 'criteria': '>', 'value': 0,
    'format': workbook.add_format({'bg_color': C_SUCCESS_BG, 'font_color': C_SUCCESS_TXT, 'num_format': 'Rs #,##0'})
})


# ==============================================================================
# SHEET 3: Budget vs Actual
# ==============================================================================
ws_bva = workbook.add_worksheet('Budget vs Actual')
ws_bva.hide_gridlines(0)
ws_bva.freeze_panes(4, 2)

# Title
ws_bva.set_row(0, 28)
ws_bva.set_row(1, 16)
ws_bva.merge_range('B1:J1', '  BUDGET TARGETS VS ACTUAL EXPENSES & VARIANCE', f_title)
ws_bva.merge_range('B2:J2', '  Spending Limit Compliance, Variance Analysis & Over-Budget Alerts', f_subtitle)

# Column Widths
ws_bva.set_column('A:A', 3)
ws_bva.set_column('B:B', 24)  # Category
ws_bva.set_column('C:C', 26)  # Group
ws_bva.set_column('D:D', 16)  # Monthly Target
ws_bva.set_column('E:E', 16)  # Monthly Actual Avg
ws_bva.set_column('F:F', 16)  # Annual Target
ws_bva.set_column('G:G', 16)  # Annual Actual YTD
ws_bva.set_column('H:H', 16)  # Variance (Rs)
ws_bva.set_column('I:I', 13)  # Variance %
ws_bva.set_column('J:J', 16)  # Status

# Table Header
ws_bva.set_row(3, 26)
ws_bva.write('B4', 'Expense Category', f_tbl_hdr_left)
ws_bva.write('C4', 'Category Group', f_tbl_hdr_left)
ws_bva.write('D4', 'Monthly Target', f_tbl_hdr)
ws_bva.write('E4', 'Actual Mo. Avg', f_tbl_hdr_accent)
ws_bva.write('F4', 'Annual Target (12M)', f_tbl_hdr)
ws_bva.write('G4', 'Actual YTD (Spent)', f_tbl_hdr_accent)
ws_bva.write('H4', 'Variance (Target - Actual)', f_tbl_hdr)
ws_bva.write('I4', 'Variance %', f_tbl_hdr)
ws_bva.write('J4', 'Budget Status', f_tbl_hdr)

bva_row = 5
for idx, (cat_name, cat_grp) in enumerate(cat_flat):
    ws_bva.set_row(bva_row - 1, 19)
    is_even = (idx % 2 == 0)
    f_t = f_data_text if is_even else f_data_text_alt
    f_n = f_data_curr if is_even else f_data_curr_alt
    f_p = f_data_pct if is_even else f_data_pct_alt
    f_c = f_data_center if is_even else f_data_center_alt
    
    m_target = BUDGET_TARGETS.get(cat_name, 0)
    t_row = cat_to_tracker_row[cat_name]
    
    ws_bva.write(f'B{bva_row}', cat_name, f_t)
    ws_bva.write(f'C{bva_row}', cat_grp, f_t)
    ws_bva.write(f'D{bva_row}', m_target, f_n)
    ws_bva.write_formula(f'E{bva_row}', f"='Monthly Tracker'!P{t_row}", f_n)
    ws_bva.write_formula(f'F{bva_row}', f"=D{bva_row}*12", f_n)
    ws_bva.write_formula(f'G{bva_row}', f"='Monthly Tracker'!O{t_row}", f_n)
    ws_bva.write_formula(f'H{bva_row}', f"=F{bva_row}-G{bva_row}", f_n)
    ws_bva.write_formula(f'I{bva_row}', f"=IF(F{bva_row}>0, (G{bva_row}-F{bva_row})/F{bva_row}, 0)", f_p)
    ws_bva.write_formula(f'J{bva_row}', f'=IF(D{bva_row}=0, "⚪ Unset", IF(E{bva_row}>D{bva_row}*1.1, "🔴 Over Budget", IF(E{bva_row}>=D{bva_row}*0.9, "🟡 Near Limit", "🟢 Within Budget")))', f_c)
    
    bva_row += 1

# Total Row
ws_bva.set_row(bva_row - 1, 24)
ws_bva.write(f'B{bva_row}', 'TOTAL BUDGET & VARIANCE', f_total_exp_lbl)
ws_bva.write(f'C{bva_row}', 'All Categories', f_total_exp_lbl)
ws_bva.write_formula(f'D{bva_row}', f'=SUM(D5:D{bva_row-1})', f_total_exp_val)
ws_bva.write_formula(f'E{bva_row}', f'=SUM(E5:E{bva_row-1})', f_total_exp_val)
ws_bva.write_formula(f'F{bva_row}', f'=SUM(F5:F{bva_row-1})', f_total_exp_val)
ws_bva.write_formula(f'G{bva_row}', f'=SUM(G5:G{bva_row-1})', f_total_exp_val)
ws_bva.write_formula(f'H{bva_row}', f'=F{bva_row}-G{bva_row}', f_total_exp_val)
ws_bva.write_formula(f'I{bva_row}', f'=(G{bva_row}-F{bva_row})/F{bva_row}', f_total_pct_val)
ws_bva.write_formula(f'J{bva_row}', f'=IF(H{bva_row}>=0, "🟢 Under Budget", "🔴 Over Budget")', f_card_label)

# Conditional Formatting on Variance
ws_bva.conditional_format(f'H5:H{bva_row-1}', {
    'type': 'cell', 'criteria': '<', 'value': 0,
    'format': workbook.add_format({'bg_color': C_DANGER_BG, 'font_color': C_DANGER_TXT})
})
ws_bva.conditional_format(f'H5:H{bva_row-1}', {
    'type': 'cell', 'criteria': '>', 'value': 0,
    'format': workbook.add_format({'bg_color': C_SUCCESS_BG, 'font_color': C_SUCCESS_TXT})
})


# ==============================================================================
# SHEET 4: Major Purchases & Notes
# ==============================================================================
ws_log = workbook.add_worksheet('Major Purchases & Notes')
ws_log.hide_gridlines(0)
ws_log.freeze_panes(4, 2)

# Title
ws_log.set_row(0, 28)
ws_log.set_row(1, 16)
ws_log.merge_range('B1:H1', '  MAJOR PURCHASES & ONE-OFF EXPENSE LOG', f_title)
ws_log.merge_range('B2:H2', '  Record of Extraordinary, Capital & Non-Recurring Expenditures (Preserved from Notes)', f_subtitle)

# Column Widths
ws_log.set_column('A:A', 3)
ws_log.set_column('B:B', 8)   # ID
ws_log.set_column('C:C', 14)  # Month
ws_log.set_column('D:D', 30)  # Item Description
ws_log.set_column('E:E', 24)  # Category
ws_log.set_column('F:F', 18)  # Amount
ws_log.set_column('G:G', 16)  # Type
ws_log.set_column('H:H', 40)  # Notes

# Header
ws_log.set_row(3, 26)
ws_log.write('B4', 'ID', f_tbl_hdr)
ws_log.write('C4', 'Month', f_tbl_hdr)
ws_log.write('D4', 'Item / Expense Description', f_tbl_hdr_left)
ws_log.write('E4', 'Associated Category', f_tbl_hdr_left)
ws_log.write('F4', 'Amount (PKR)', f_tbl_hdr_accent)
ws_log.write('G4', 'Type', f_tbl_hdr)
ws_log.write('H4', 'Notes & Financial Context', f_tbl_hdr_left)

major_items = [
    (1, 'July',     'Buying House Fan',        'Shopping / Household', 43200, 'Asset Purchase', 'Major appliance acquisition (from July note)'),
    (2, 'July',     'Abeerah Exam Fees',       'Shopping / Education', 20000, 'Education Fee',  'One-off academic examination fee'),
    (3, 'July',     'Buy New Bike Tyres',      'Bike Maintenance',      5000, 'Maintenance',    'Tyre replacement for commute safety'),
    (4, 'February', 'Shopping Event',          'Shopping',             15000, 'Lifestyle',      'Seasonal shopping expenditure'),
    (5, 'August',   'Monthly Grocery - Imtiaz','Monthly Grocery',      32693, 'Household Bulk', 'Bulk household stocking at Imtiaz Super Market'),
    (6, 'July',     'Cumulative Deficit Offset','Financial Balance',    78573, 'Cash Reserve',  'Deficit calculation: 164,573 expenses - 86,000 salary'),
]

for idx, item in enumerate(major_items):
    r_num = 5 + idx
    ws_log.set_row(r_num - 1, 20)
    is_even = (idx % 2 == 0)
    f_t = f_data_text if is_even else f_data_text_alt
    f_c = f_data_center if is_even else f_data_center_alt
    f_n = f_data_curr if is_even else f_data_curr_alt
    
    ws_log.write(f'B{r_num}', item[0], f_c)
    ws_log.write(f'C{r_num}', item[1], f_c)
    ws_log.write(f'D{r_num}', item[2], f_t)
    ws_log.write(f'E{r_num}', item[3], f_t)
    ws_log.write(f'F{r_num}', item[4], f_n)
    ws_log.write(f'G{r_num}', item[5], f_c)
    ws_log.write(f'H{r_num}', item[6], f_t)

# Total Row
tot_log_row = 5 + len(major_items)
ws_log.set_row(tot_log_row - 1, 24)
ws_log.write(f'B{tot_log_row}', '', f_total_exp_lbl)
ws_log.write(f'C{tot_log_row}', '', f_total_exp_lbl)
ws_log.write(f'D{tot_log_row}', 'TOTAL MAJOR ITEMS IDENTIFIED', f_total_exp_lbl)
ws_log.write(f'E{tot_log_row}', '', f_total_exp_lbl)
ws_log.write_formula(f'F{tot_log_row}', f'=SUM(F5:F{tot_log_row-1})', f_total_exp_val)
ws_log.write(f'G{tot_log_row}', '', f_total_exp_lbl)
ws_log.write(f'H{tot_log_row}', 'One-off items represent the majority of peak variance in July & August', f_total_exp_lbl)


# ==============================================================================
# SHEET 5: Quarterly Analysis
# ==============================================================================
ws_trend = workbook.add_worksheet('Quarterly Analysis')
ws_trend.hide_gridlines(0)
ws_trend.freeze_panes(4, 2)

# Title
ws_trend.set_row(0, 28)
ws_trend.set_row(1, 16)
ws_trend.merge_range('B1:I1', '  QUARTERLY PERFORMANCE & SPENDING VELOCITY', f_title)
ws_trend.merge_range('B2:I2', '  Quarterly Expense Aggregation, Income vs Outflow & Peak Month Detection', f_subtitle)

# Column Widths
ws_trend.set_column('A:A', 3)
ws_trend.set_column('B:B', 24)  # Category
ws_trend.set_column('C:C', 15)  # Q1 (Jan-Mar)
ws_trend.set_column('D:D', 15)  # Q2 (Apr-Jun)
ws_trend.set_column('E:E', 15)  # Q3 (Jul-Sep)
ws_trend.set_column('F:F', 15)  # Q4 (Oct-Dec)
ws_trend.set_column('G:G', 16)  # Total YTD
ws_trend.set_column('H:H', 16)  # Max Month
ws_trend.set_column('I:I', 14)  # % of Total

# Header
ws_trend.set_row(3, 26)
ws_trend.write('B4', 'Expense Category', f_tbl_hdr_left)
ws_trend.write('C4', 'Q1 (Jan - Mar)', f_tbl_hdr)
ws_trend.write('D4', 'Q2 (Apr - Jun)', f_tbl_hdr)
ws_trend.write('E4', 'Q3 (Jul - Sep)', f_tbl_hdr)
ws_trend.write('F4', 'Q4 (Oct - Dec)', f_tbl_hdr)
ws_trend.write('G4', 'Total (YTD)', f_tbl_hdr_accent)
ws_trend.write('H4', 'Max Month Spend', f_tbl_hdr)
ws_trend.write('I4', '% of Category', f_tbl_hdr)

t_row = 5
for idx, (c_name, c_grp) in enumerate(cat_flat):
    ws_trend.set_row(t_row - 1, 19)
    is_even = (idx % 2 == 0)
    f_t = f_data_text if is_even else f_data_text_alt
    f_n = f_data_curr if is_even else f_data_curr_alt
    f_p = f_data_pct if is_even else f_data_pct_alt
    
    tr_r = cat_to_tracker_row[c_name]
    
    ws_trend.write(f'B{t_row}', c_name, f_t)
    ws_trend.write_formula(f'C{t_row}', f"=SUM('Monthly Tracker'!C{tr_r}:E{tr_r})", f_n)
    ws_trend.write_formula(f'D{t_row}', f"=SUM('Monthly Tracker'!F{tr_r}:H{tr_r})", f_n)
    ws_trend.write_formula(f'E{t_row}', f"=SUM('Monthly Tracker'!I{tr_r}:K{tr_r})", f_n)
    ws_trend.write_formula(f'F{t_row}', f"=SUM('Monthly Tracker'!L{tr_r}:N{tr_r})", f_n)
    ws_trend.write_formula(f'G{t_row}', f"=SUM(C{t_row}:F{t_row})", f_data_curr_bold)
    ws_trend.write_formula(f'H{t_row}', f"=MAX('Monthly Tracker'!C{tr_r}:N{tr_r})", f_n)
    ws_trend.write_formula(f'I{t_row}', f"=IF($G$20>0, G{t_row}/$G$20, 0)", f_p)
    
    t_row += 1

# Total Row for Quarterly Analysis
ws_trend.set_row(t_row - 1, 24)
ws_trend.write(f'B{t_row}', 'TOTAL QUARTERLY EXPENSES', f_total_exp_lbl)
ws_trend.write_formula(f'C{t_row}', f'=SUM(C5:C{t_row-1})', f_total_exp_val)
ws_trend.write_formula(f'D{t_row}', f'=SUM(D5:D{t_row-1})', f_total_exp_val)
ws_trend.write_formula(f'E{t_row}', f'=SUM(E5:E{t_row-1})', f_total_exp_val)
ws_trend.write_formula(f'F{t_row}', f'=SUM(F5:F{t_row-1})', f_total_exp_val)
ws_trend.write_formula(f'G{t_row}', f'=SUM(G5:G{t_row-1})', f_total_exp_val)
ws_trend.write_formula(f'H{t_row}', f'=MAX(C{t_row}:F{t_row})', f_total_exp_val)
ws_trend.write(f'I{t_row}', 1.0, f_total_pct_val)

# Quarterly Comparison Chart
chart_quarter = workbook.add_chart({'type': 'column'})
chart_quarter.add_series({
    'name':       'Quarterly Expenses',
    'categories': "='Quarterly Analysis'!$C$4:$F$4",
    'values':     f"='Quarterly Analysis'!$C${t_row}:$F${t_row}",
    'fill':       {'color': '#6366F1'},
    'border':     {'none': True}
})
chart_quarter.set_title({'name': 'Quarterly Expense Outflow (Q1 - Q4)', 'name_font': {'size': 12, 'bold': True, 'name': FONT}})
chart_quarter.set_x_axis({'name': 'Quarter', 'name_font': {'size': 9, 'name': FONT}})
chart_quarter.set_y_axis({'name': 'Total Outflow (PKR)', 'name_font': {'size': 9, 'name': FONT}, 'major_gridlines': {'visible': True, 'line': {'color': '#E2E8F0'}}})
chart_quarter.set_legend({'none': True})
chart_quarter.set_size({'width': 580, 'height': 300})
chart_quarter.set_chartarea({'border': {'color': '#CBD5E1'}})
ws_trend.insert_chart('B22', chart_quarter)

workbook.close()
print("Perfection: Successfully generated luxury budget workbook!")
