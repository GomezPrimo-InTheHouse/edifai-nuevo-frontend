import { Chip } from '@mui/material';

interface StockBadgeProps {
  stock: number;
  unidad: string;
}

export const StockBadge: React.FC<StockBadgeProps> = ({ stock, unidad }) => {
  const color = stock <= 0 ? 'error' : stock < 10 ? 'warning' : 'success';
  const label = stock <= 0 ? 'Sin stock' : `${stock} ${unidad}`;
  return <Chip label={label} color={color} size="small" sx={{ fontWeight: 700, fontSize: 12 }} />;
};