// Shared chart colors for consistency across the application
export const CHART_COLORS = {
  primary: ['#00B8D9', '#FFBB28', '#FF8042', '#A259F7', '#F95F62', '#00C49F'],
  analytics: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A259F7', '#F95F62'],
  passwordStrength: ['red', 'orange', 'yellow', 'lightgreen', 'green', 'darkgreen']
};

// Default chart colors (most commonly used)
export const COLORS = CHART_COLORS.primary;

// Chart configuration constants
export const CHART_CONFIG = {
  animationDuration: 900,
  animationEasing: 'ease-out',
  barRadius: 6,
  pieInnerRadius: 60,
  pieOuterRadius: 100,
  piePaddingAngle: 2
};

// Tooltip styling
export const TOOLTIP_STYLES = {
  background: '#181F2A',
  border: 'none',
  borderRadius: 8,
  color: '#fff',
  boxShadow: '0 2px 8px #00B8D955'
};
