import re

with open('src/index.css', 'r') as f:
    content = f.read()

# I will replace the @theme block with light mode values
# and then append the :root[data-theme="dark"] inside @layer base

light_theme = '''@theme {
  /* Backgrounds */
  --color-bg: #F8FAFC;
  --color-surface: #FFFFFF;
  --color-surface-elevated: #F1F5F9;

  /* Accent colors (Coral/Red primary for Huda Festival) */
  --color-primary: #E11D48; 
  --color-primary-hover: #BE123C;
  --color-accent-candidates: #8B5CF6;
  --color-accent-programmes: #F59E0B;
  --color-accent-results: #10B981;
  --color-accent-adjustments: #EC4899;

  /* Borders */
  --color-border: #E2E8F0;
  --color-border-subtle: #F1F5F9;

  /* Text */
  --color-text-heading: #0F172A;
  --color-text-body: #334155;
  --color-text-muted: #64748B;

  /* Status */
  --color-status-approved: #059669;
  --color-status-approved-bg: rgba(16, 185, 129, 0.1);
  --color-status-pending: #D97706;
  --color-status-pending-bg: rgba(245, 158, 11, 0.1);
  --color-status-rejected: #DC2626;
  --color-status-rejected-bg: rgba(239, 68, 68, 0.1);
  --color-status-published: #4338CA;
  --color-status-published-bg: rgba(79, 70, 229, 0.1);

  /* Legacy aliases */
  --color-admin-bg: var(--color-bg);
  --color-sidebar-bg: var(--color-surface);
  --color-card-bg: var(--color-surface);
  --color-header-bar: var(--color-primary);
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
}'''

dark_layer = '''
  :root[data-theme="dark"] {
    --color-bg: #0A0A0B;
    --color-surface: #121214;
    --color-surface-elevated: #1C1C1F;

    --color-primary: #FB7185;
    --color-primary-hover: #F43F5E;
    
    --color-accent-candidates: #A78BFA;
    --color-accent-programmes: #FBBF24;
    --color-accent-results: #34D399;
    --color-accent-adjustments: #F472B6;

    --color-border: #27272A;
    --color-border-subtle: #18181B;

    --color-text-heading: #F8FAFC;
    --color-text-body: #D1D5DB;
    --color-text-muted: #9CA3AF;

    --color-status-approved: #10B981;
    --color-status-approved-bg: rgba(16, 185, 129, 0.1);
    --color-status-pending: #F59E0B;
    --color-status-pending-bg: rgba(245, 158, 11, 0.1);
    --color-status-rejected: #EF4444;
    --color-status-rejected-bg: rgba(239, 68, 68, 0.1);
    --color-status-published: #4F46E5;
    --color-status-published-bg: rgba(79, 70, 229, 0.1);
  }
'''

content = re.sub(r'@theme \{.*?\n\}', light_theme, content, flags=re.DOTALL)
content = content.replace('@layer base {\n', '@layer base {' + dark_layer)

with open('src/index.css', 'w') as f:
    f.write(content)
