import { useState } from 'react';
import { Box, IconButton, TextField, useTheme } from '@mui/material';
import { Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ChatInputProps {
  onSend: (mensaje: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [texto, setTexto] = useState('');

  const handleSend = () => {
    if (!texto.trim()) return;
    onSend(texto.trim());
    setTexto('');
  };

  return (
    <Box sx={{
      display: 'flex', gap: 1, p: 1.5,
      borderTop: `1px solid ${theme.palette.divider}`,
      bgcolor: 'background.paper',
    }}>
      <TextField
        fullWidth
        size="small"
        placeholder={t('market.chat.placeholder')}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
        disabled={disabled}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
      />
      <IconButton
        onClick={handleSend}
        disabled={disabled || !texto.trim()}
        sx={{
          bgcolor: '#F59E0B', color: '#0F172A',
          '&:hover': { bgcolor: '#D97706' },
          '&:disabled': { bgcolor: theme.palette.action.disabledBackground },
          borderRadius: 2,
        }}
      >
        <Send size={18} />
      </IconButton>
    </Box>
  );
};