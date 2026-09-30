const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/index.css', 'utf8');

if (!c.includes('@media print')) {
    c += `

@media print {
  body {
    background-color: white !important;
    color: black !important;
  }
  
  /* Hide sidebars and topbars */
  aside, nav, header, .top-bar-container, .sidebar-container {
    display: none !important;
  }
  
  /* Make main content area take full width without scrolling */
  main {
    overflow: visible !important;
    height: auto !important;
    padding: 0 !important;
  }
  
  /* Hide buttons */
  button {
    display: none !important;
  }
  
  /* Convert dark surface colors to light borders for print */
  .bg-\\[var\\(--color-surface\\)\\] {
    background-color: white !important;
    border: 1px solid #ddd !important;
    color: black !important;
  }
  
  .bg-\\[var\\(--color-surface-elevated\\)\\] {
    background-color: #f9f9f9 !important;
    border: 1px solid #ddd !important;
    color: black !important;
  }
  
  /* Fix text colors */
  .text-\\[var\\(--color-text-heading\\)\\] {
    color: black !important;
  }
  .text-\\[var\\(--color-text-muted\\)\\] {
    color: #444 !important;
  }
}
`;
    fs.writeFileSync('admin-hudafestival-main/src/index.css', c);
    console.log('Added print CSS to index.css');
}
